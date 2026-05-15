# Backend

Roadmap Planner 백엔드 작업 공간입니다.

## 필요 환경

- uv
- Python 3.13
- MongoDB Atlas cluster
- Docker Desktop (Docker로 API를 실행할 때만 필요)

## 환경 변수 설정

`backend` 폴더에서 `.env.example`을 복사해 로컬 `.env` 파일을 만듭니다.

```bash
cp .env.example .env
```

`.env`에는 MongoDB Atlas 접속 정보와 비밀번호 해싱용 `PASSWORD_PEPPER`를 채워 넣습니다. 이 파일은 Git에 올라가지 않습니다.

백엔드는 `MONGODB_URI`로 MongoDB Atlas에 접속하고, `MONGODB_DATABASE` 이름의 DB를 사용합니다.


## Docker로 실행

모든 명령은 `backend` 폴더에서 실행합니다.

```bash
docker compose up --build
```

위 명령은 `.env`의 Atlas URI를 사용해 API 서버만 실행합니다.

- FastAPI API 서버: `http://localhost:8000`

서비스 종료:

```bash
docker compose down
```

## 프론트엔드 연결 정보

로컬 개발에서 프론트엔드는 아래 주소를 API base URL로 사용하면 됩니다.

```text
http://localhost:8000
```

## 회원가입과 로그인

`/auth/signup`은 새 사용자를 만들고 세션을 발급합니다.

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "student@kaist.ac.kr",
  "password": "secure-password",
  "name": "Student",
  "graduationYear": 2027
}
```

이미 가입된 사용자는 `/auth/login`에 KAIST 이메일과 비밀번호를 전달해 새 세션을 발급받습니다.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "student@kaist.ac.kr",
  "password": "secure-password"
}
```

응답의 `sessionToken`을 이후 사용자 기반 API에 Bearer token으로 전달합니다.

```http
GET /me
Authorization: Bearer <sessionToken>
```

## MongoDB 연결 정보

MongoDB Compass나 VS Code MongoDB extension 같은 외부 도구에서는 각자의 `.env`에 있는 `MONGODB_URI` 값을 사용해 접속합니다.

VS Code MongoDB extension에서 `mongodb+srv://` 연결이 실패하면 Atlas SRV record를 직접 풀어
`mongodb://host1,host2,host3/...` 형태의 standard connection string을 사용합니다.

## Course 데이터 seed

Atlas DB에 기본 과목 데이터를 넣습니다.

```bash
uv run python scripts/seed_courses.py --drop
```

`--drop`은 `courses`, `course_categories`, `course_sectors` collection을 먼저 비운 뒤
`data/` 아래 JSON 파일을 다시 넣습니다.

## 프로젝트 구조

```text
src/
  fastapi_app/
    main.py
    routers/
  db/
    client.py
    models/
```

주요 파일:

- `src/fastapi_app/main.py`: FastAPI 앱 엔트리포인트
- `src/db/client.py`: MongoDB 및 Beanie 초기화 코드
- `src/db/models/example.py`: 테스트용 Beanie document 모델
- `docker-compose.yml`: API 서비스 설정

## 관련 문서

- `../docs/RoadmapPlanner SRS.pdf`: 원본 요구사항 문서
- `../docs/workplan.md`: 백엔드 작업 계획
- `../docs/API.md`: API 계약 초안
- `../docs/tech-stack.md`: 백엔드 기술 스택 메모
- `../docs/gitcommit.md`: 커밋 메시지 규칙
