# KAIST CS Roadmap Planner

KAIST 전산학부 학부생을 위한 졸업 로드맵 웹 / 앱입니다. 

## 구현한 주요 기능

### 사용자 인증

- KAIST 이메일 기반 회원가입 및 로그인
- 이메일 인증 링크 발송 및 인증 처리
- Bearer session token 기반 인증
- 로그아웃, 현재 사용자 조회, 계정 삭제
- 사용자별 설정 저장

### 과목 탐색 및 Tree 화면

- 과목명, 과목코드 기반 검색
- 이수구분, 세부 분야, 개설 학기, 주요 과목, 과목 레벨 필터링
- 전공필수, 전공선택 분야, 주요 과목, 기초 선택 중심의 Discover 화면
- 과목 상세 정보와 선수과목 정보 표시
- 사이드바 검색 결과에서 Discover 트리로 이동

### 로드맵 및 시간표 관리

- 로그인한 사용자별 학기별 로드맵 저장
- 과목 CRUD
- 학기 추가 및 삭제
- 웹 및 모바일 환경의 HTML5 Drag and Drop 지원
- 이수구분/분야별 필터링
- 선수과목 순서 위반 경고

### 이수 현황 및 학점/GPA 계산

- 현재 학기 설정
- 과목별 성적 입력
- 완료 학점, 수강 중 학점, 남은 학점 요약
- GPA 계산
- 기초, 전공필수, 전공선택, 졸업연구 요건별 진행도 표시
- 카테고리별 상세 과목 목록
- 커스텀 과목 추가


## 기술 스택

### Frontend
- React
- React Native Expo
- TypeScript

### Backend

- Python 
- FastAPI
- MongoDB Atlas
- Docker / Docker Compose

## 프로젝트 구조

```text
.
├── backend/              # FastAPI API 서버, DB 모델, 서비스, 테스트
│   ├── data/             # 과목/카테고리/분야 seed JSON
│   ├── scripts/          # DB seed 및 SMTP 테스트 스크립트
│   └── src/
│       ├── db/           # MongoDB/Beanie client 및 document 모델
│       ├── fastapi_app/  # routers, services, schemas, main app
│       └── tests/        # 백엔드 테스트
├── frontend/             # Expo React Native 앱
│   ├── app/              # expo-router 라우트
│   ├── components/       # 화면별 UI 컴포넌트
│   ├── constants/        # 카테고리, 졸업요건, API 설정
│   ├── hooks/            # Drag and Drop 등 공용 hook
│   └── lib/              # API client, session, theme, 상태 매핑
├── docs/                 # SRS, API 문서, 기술 스택, 작업 문서
├── GUIDE.md              # 로컬 실행 가이드
└── README.md
```

## 로컬 실행

실행 방법은 [`GUIDE.md`](./GUIDE.md)를 참고하세요. 

## API 명세

전체 API 명세는 [`docs/API.md`](./docs/API.md)를 참고하세요.

## 관련 문서

- [`GUIDE.md`](./GUIDE.md): 로컬 실행 가이드
- [`backend/README.md`](./backend/README.md): 백엔드 실행 및 구조
- [`frontend/FRONTEND.md`](./frontend/FRONTEND.md): 프론트엔드 실행 및 구조
- [`docs/API.md`](./docs/API.md): API 명세
- [`docs/tech-stack.md`](./docs/tech-stack.md): 기술 스택 메모
- [`docs/RoadmapPlanner SRS.pdf`](./docs/RoadmapPlanner%20SRS.pdf): 요구사항 문서

