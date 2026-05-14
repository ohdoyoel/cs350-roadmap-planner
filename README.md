# Roadmap Planner

KAIST 전산학부 학생용 학업 계획 앱. 졸업 진행, 선수 과목 트리, 학기별 로드맵, GPA 계산을 한 곳에서 관리한다.

## 프로젝트 구조

- `frontend/` — Expo (React Native + expo-router) 기반 web/native 클라이언트
- `backend/` — FastAPI + MongoDB 백엔드
- `docs/` — SRS, API 명세, 작업 계획, 기술 스택, 커밋 컨벤션, KAIST CS 로드맵 PDF

## 실행

### Frontend (web)

```bash
cd frontend
npm install
npm run web
```

브라우저에서 http://localhost:8081 접속. 데스크톱에서는 400×844 폰 프레임 안에 렌더된다.

iOS / Android 네이티브 빌드는 별도 셋업 후 `npm run ios` / `npm run android` 사용 (Xcode / Android Studio 필요).

### Backend (FastAPI + MongoDB)

```bash
cd backend
cp .env.example .env       # MONGODB_URI 등 채우기
docker compose up --build
```

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- MongoDB: localhost:27018

자세한 내용은 [backend/README.md](backend/README.md).

## 문서

- 요구사항: [docs/RoadmapPlanner SRS.pdf](docs/RoadmapPlanner%20SRS.pdf)
- API 명세: [docs/API.md](docs/API.md)
- 작업 계획: [docs/workplan.md](docs/workplan.md)
- 기술 스택: [docs/tech-stack.md](docs/tech-stack.md)
- 커밋 컨벤션: [docs/gitcommit.md](docs/gitcommit.md)
- KAIST 전산학부 학부 로드맵: [docs/카이스트_전산학부_학부_로드맵_(학사과정용.)_.pdf](docs/카이스트_전산학부_학부_로드맵_%28학사과정용.%29_.pdf)
