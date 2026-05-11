# Backend

Roadmap Planner 백엔드 작업 공간입니다.

## 필요 환경

- Docker Desktop
- uv
- Python 3.13

## 환경 변수 설정

`backend` 폴더에서 `.env.example`을 복사해 로컬 `.env` 파일을 만듭니다.

```bash
cp .env.example .env
```

`.env`에는 MongoDB 접속 정보와 비밀번호 해싱용 `PASSWORD_PEPPER`를 채워 넣습니다. 이 파일은 Git에 올라가지 않습니다.

현재 로컬 Docker 개발 환경에서는 백엔드가 `MONGODB_URI`를 통해 MongoDB에 접속합니다.

## Docker로 실행

모든 명령은 `backend` 폴더에서 실행합니다.

```bash
docker compose up --build
```

위 명령을 실행하면 다음 서비스가 뜹니다.

- FastAPI API 서버: `http://localhost:8000`
- MongoDB: `localhost:27018`

서비스 종료:

```bash
docker compose down
```

MongoDB 볼륨까지 삭제하고 초기화:

```bash
docker compose down -v
```

`down -v`는 로컬 DB 데이터를 삭제하므로, 데이터를 지워도 될 때만 사용합니다.

## 프론트엔드 연결 정보

로컬 개발에서 프론트엔드는 아래 주소를 API base URL로 사용하면 됩니다.

```text
http://localhost:8000
```

현재 확인 가능한 기본 엔드포인트:

```text
GET http://localhost:8000/health
GET http://localhost:8000/db/health
POST http://localhost:8000/auth/login
POST http://localhost:8000/auth/signup
GET http://localhost:8000/me
GET http://localhost:8000/courses
GET http://localhost:8000/courses/categories
GET http://localhost:8000/courses/sectors
GET http://localhost:8000/examples
POST http://localhost:8000/examples
```

FastAPI 문서 페이지:

```text
http://localhost:8000/docs
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

MongoDB Compass나 VS Code MongoDB extension 같은 외부 도구에서는 각자의 로컬
`.env`에 있는 `MONGODB_URI` 값을 사용해 접속합니다.

## DB 백업과 복원

현재 `roadmap_planner` DB를 archive 파일로 저장합니다.

```bash
bash db-backup/download.sh
```

기본 archive 파일에서 DB를 복원합니다.

```bash
bash db-backup/upload.sh
```

기본 archive 파일 경로:

```text
db-backup/roadmap_planner.archive.gz
```

복원 스크립트는 내부적으로 `mongorestore --drop`을 사용합니다.

`--drop`은 archive에 포함된 collection을 복원하기 전에, 같은 이름의 기존 collection을
먼저 삭제합니다. 예를 들어 archive에 `examples` collection이 들어 있다면, 현재 DB의
`examples` collection은 삭제된 뒤 archive 안의 `examples` 내용으로 다시 생성됩니다.

archive에 없는 collection은 이 복원 과정에서 직접 삭제되지 않습니다. 다만 백업 시점의
DB 상태로 맞추려는 목적이라면, 복원 전에 필요한 데이터가 archive에 포함되어 있는지 먼저
확인해야 합니다.

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
- `docker-compose.yml`: 로컬 API 및 MongoDB 서비스 설정
- `db-backup/`: MongoDB 백업/복원 스크립트

## 관련 문서

- `../docs/RoadmapPlanner SRS.pdf`: 원본 요구사항 문서
- `../docs/workplan.md`: 백엔드 작업 계획
- `../docs/API.md`: API 계약 초안
- `../docs/tech-stack.md`: 백엔드 기술 스택 메모
- `../docs/gitcommit.md`: 커밋 메시지 규칙
