# 로컬 실행 가이드

KAIST CS Roadmap Planner 를 로컬에서 띄우는 절차입니다. 백엔드(FastAPI + MongoDB Atlas)와 프론트엔드(Expo) 두 개를 각각 다른 터미널에서 실행합니다.

## 0. 사전 준비물

- **공통**
  - Git, 그리고 이 저장소 clone
- **백엔드**
  - Docker Desktop (간단한 방법) **또는** [uv](https://docs.astral.sh/uv/) + Python 3.13 (도커 없이 실행할 때)
  - MongoDB Atlas cluster 접속 정보 (`MONGODB_URI`)
- **프론트엔드**
  - Node 20+ / npm
  - (선택) iOS 시뮬레이터용 Xcode + CocoaPods
  - (선택) Android 에뮬레이터용 Android Studio + JDK 17

---

## 1. 백엔드 서버 켜기

모든 명령은 `backend/` 폴더에서 실행합니다.

```bash
cd backend
```

### 1-1. 환경 변수 파일 만들기

`.env.example` 을 복사해 `.env` 를 만듭니다.

```bash
cp .env.example .env
```

> **`.env` 실제 값은 팀 노션 문서를 참고하세요.** (MongoDB Atlas URI, `PASSWORD_PEPPER` 등)
> `.env` 는 Git 에 올라가지 않습니다.

참고용 항목 설명:

| 키 | 설명 |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas 연결 문자열 (`mongodb+srv://...`) |
| `MONGODB_DATABASE` | 사용할 DB 이름 (기본 `roadmap_planner`) |
| `TEST_MONGODB_DATABASE` | 테스트용 DB 이름 |
| `SESSION_IDLE_TIMEOUT_MINUTES` | 세션 유휴 만료 시간(분) |
| `PASSWORD_PEPPER` | 비밀번호 해싱용 시크릿 |

### 1-2. 옵션 A — Docker 로 실행 (권장)

```bash
docker compose up --build
```

- FastAPI API 서버가 `http://localhost:8000` 에 뜹니다.
- 종료: `Ctrl+C` 후

  ```bash
  docker compose down
  ```

### 1-2. 옵션 B — uv 로 직접 실행 (Docker 없이)

```bash
uv sync
uv run uvicorn fastapi_app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 1-3. (최초 1회) 과목 데이터 seed

Atlas DB 에 기본 과목 데이터를 채워 넣습니다. **프론트 Discover/Status 가 빈 화면이 아니라 정상적으로 보이려면 필요합니다.**

```bash
uv run python scripts/seed_courses.py --drop
```

`--drop` 옵션은 `courses`, `course_categories`, `course_sectors` collection 을 비운 뒤 `data/` 아래 JSON 을 다시 적재합니다.

### 1-4. 헬스체크

다른 터미널에서:

```bash
curl http://localhost:8000/docs
```

브라우저에서 `http://localhost:8000/docs` 를 열어 FastAPI 자동 문서가 보이면 OK.

---

## 2. 프론트엔드 Expo 서버 켜기

새 터미널을 열어 `frontend/` 폴더로 이동합니다.

```bash
cd frontend
```

### 2-1. 의존성 설치

```bash
npm install
```

### 2-2. 실행

| 명령 | 대상 |
| --- | --- |
| `npm run web` | 브라우저 — `http://localhost:8081` |
| `npm run ios` | iOS 시뮬레이터 (macOS + Xcode 필요) |
| `npm run android` | Android 에뮬레이터 (Android Studio 필요) |
| `npm run start` | Expo Dev Tools 메뉴에서 선택 |

가장 빠른 검증은 웹입니다.

```bash
npm run web
```

### 2-3. API 주소 바꾸기 (옵션)

기본값은 `http://localhost:8000` 입니다 (`constants/Config.ts`).

- **Android 에뮬레이터** 는 자동으로 `http://10.0.2.2:8000` 으로 매핑되니 따로 설정할 게 없습니다.
- 다른 머신에서 띄운 백엔드를 가리키려면 환경 변수로 덮어씁니다.

  ```bash
  EXPO_PUBLIC_API_BASE=http://192.168.0.10:8000 npm run web
  ```

---

## 3. 동작 확인

1. 백엔드 `docker compose up` 이 뜬 상태에서
2. 프론트 `npm run web` 으로 `http://localhost:8081` 접속
3. 회원가입 / 로그인 후 Discover · Timetable · Status 탭이 데이터를 불러오면 정상

### 자주 마주치는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| 프론트가 빈 과목 리스트만 보임 | `seed_courses.py --drop` 을 안 돌림 → 1-3 참고 |
| `Network request failed` | 백엔드가 안 떠 있거나, 다른 머신에 떠 있는데 `EXPO_PUBLIC_API_BASE` 를 안 줌 |
| Atlas 접속 실패 | `MONGODB_URI` 의 비밀번호 URL 인코딩, 그리고 Atlas Network Access 에 본인 IP allow 됐는지 확인 |
| 8000 / 8081 포트가 이미 사용 중 | 기존 프로세스 종료 후 재시도 |

---

## 4. 더 자세한 문서

- `backend/README.md` — API 엔드포인트, 회원가입/로그인 예시, 프로젝트 구조
- `frontend/FRONTEND.md` — 폴더 구조, 타입체크, DnD 동작 방식
- `docs/` — SRS, API 계약, 작업 계획
