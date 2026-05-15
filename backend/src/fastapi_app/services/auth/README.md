# Auth Service Package

이 패키지는 백엔드 인증 관련 서비스 로직을 모아둔 곳입니다.

## 인증 방식

현재 인증은 정식 KAIST SSO가 아니라 개발용 KAIST 이메일 기반 로그인입니다.

- 회원가입 시 `@kaist.ac.kr` 이메일만 허용합니다.
- 이메일은 앞뒤 공백을 제거하고 소문자로 정규화해서 저장합니다.
- 이메일 인증 메일 발송이나 SSO 연동은 아직 구현하지 않았습니다.
- 로그인 성공 시 서버가 session token을 발급하고, 클라이언트는 이후 요청에 Bearer token으로 전달합니다.

```http
Authorization: Bearer <sessionToken>
```

## 파일 구성

- `service.py`
  - `signup`, `login`, `logout` 같은 인증 use case를 구현합니다.
  - 사용자 생성, 사용자 설정 생성, 비밀번호 검증, 세션 생성/종료 흐름을 조합합니다.

- `sessions.py`
  - 세션 토큰의 생명주기를 담당합니다.
  - 세션 토큰 생성, 토큰 해시 저장, 활성 세션 검증, idle 만료 시간 갱신, 세션 종료를 처리합니다.

- `security.py`
  - 인증에 필요한 낮은 수준의 보안 helper를 담당합니다.
  - 랜덤 세션 토큰을 생성합니다.
  - DB에 저장하기 전에 세션 토큰을 해시합니다.
  - PBKDF2, salt, `PASSWORD_PEPPER`를 사용해 비밀번호를 해시하고 검증합니다.
  - 환경 변수에서 `SESSION_IDLE_TIMEOUT_MINUTES`와 `PASSWORD_PEPPER`를 읽습니다.

- `__init__.py`
  - 라우터가 auth 패키지를 서비스 모듈처럼 import할 수 있도록 주요 인증 use case를 다시 export합니다.

## 비밀번호 저장 방식

비밀번호는 평문으로 저장하지 않습니다.

회원가입 시 `security.hash_password()`가 다음 값을 사용해 비밀번호 해시를 만듭니다.

- PBKDF2-HMAC-SHA256
- 랜덤 salt
- `PASSWORD_PEPPER` 환경 변수
- 기본 반복 횟수: `600_000`

저장 형식은 다음과 같습니다.

```text
pbkdf2_sha256$600000$<salt>$<hash>
```

`salt`는 사용자 비밀번호마다 새로 생성되어 `password_hash` 문자열 안에 포함됩니다.
DB에 `salt`라는 별도 필드가 생기는 것은 아닙니다.

예를 들어 DB의 `users.password_hash` 값이 다음과 같다면:

```text
pbkdf2_sha256$600000$4f8a91c0e2d3$9b1c0a7d...
```

`$` 기준으로 나눴을 때 세 번째 값인 `4f8a91c0e2d3`가 salt입니다.
로그인 검증 시에는 저장된 `password_hash` 문자열을 다시 나누어 알고리즘, 반복 횟수, salt,
기존 hash 값을 꺼냅니다.

`PASSWORD_PEPPER`는 DB에 저장하지 않고 서버 환경 변수로만 관리합니다.

로그인 시 `security.verify_password()`가 입력 비밀번호와 저장된 해시를 같은 방식으로 다시 계산한 뒤,
`hmac.compare_digest()`로 비교합니다.

`PASSWORD_PEPPER`가 바뀌면 기존 비밀번호 검증이 실패합니다. 운영 중에는 같은 DB를 쓰는 서버들이
같은 `PASSWORD_PEPPER` 값을 사용해야 합니다.

## 세션 저장 방식

로그인 또는 회원가입 성공 시 `sessions.start_session()`이 랜덤 session token을 생성합니다.

서버는 원본 token을 DB에 저장하지 않고, SHA-256 해시값만 `auth_sessions.token_hash`에 저장합니다.
클라이언트에는 원본 token을 한 번만 응답으로 내려줍니다.

```text
client token -> SHA-256 -> auth_sessions.token_hash
```

이후 인증이 필요한 요청에서는 Bearer token을 받아 같은 방식으로 해시한 뒤,
활성 세션과 비교합니다.

## 세션 만료 정책

세션은 idle timeout 방식으로 만료됩니다.

- 기본 idle timeout은 60분입니다.
- `SESSION_IDLE_TIMEOUT_MINUTES` 환경 변수로 조정할 수 있습니다.
- 유효한 세션으로 인증 요청이 들어오면 `last_used_at`과 `expires_at`을 갱신합니다.
- 즉, 사용자가 계속 요청을 보내면 세션 만료 시간이 연장됩니다.

세션 생성 시:

```text
expires_at = now + SESSION_IDLE_TIMEOUT_MINUTES
```

세션 검증 성공 시:

```text
last_used_at = now
expires_at = now + SESSION_IDLE_TIMEOUT_MINUTES
```

## 세션 만료 후 동작

`sessions.validate_session()`은 다음 경우 `401 Unauthorized`를 반환합니다.

- Bearer token이 없을 때
- token hash와 일치하는 활성 세션이 없을 때
- 세션의 `expires_at`이 현재 시각보다 과거일 때

만료된 세션을 발견하면 서버는 해당 session document를 다음처럼 업데이트합니다.

```text
is_active = false
ended_at = now
```

그 후 클라이언트에는 다음 오류를 반환합니다.

```json
{
  "detail": "Session expired"
}
```

로그아웃 시에도 같은 세션을 비활성화합니다.

```text
is_active = false
ended_at = now
```

로그아웃 후 같은 token을 다시 사용하면 활성 세션을 찾을 수 없으므로 `401 Unauthorized`가 반환됩니다.

## 요청 흐름

```text
router
  -> auth.service signup/login/logout
    -> auth.security 비밀번호/토큰 helper
    -> auth.sessions 세션 저장/검증
    -> users/settings services 사용자 관련 데이터
```

인증이 필요한 라우터는 `sessions.py`를 직접 호출하지 않는 것을 기본으로 합니다.
대신 `fastapi_app.dependencies.get_current_user` 또는 `get_current_session`을 사용합니다.
이 함수들은 세션 검증을 FastAPI `Depends(...)` 형태로 감싼 라우터용 dependency입니다.
