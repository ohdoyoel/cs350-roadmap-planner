# Frontend

KAIST CS Roadmap Planner 의 Expo (React Native + Web) 프론트엔드.

## 요구사항

- Node 20+ / npm
- (선택) Xcode + CocoaPods — iOS 빌드
- (선택) Android Studio + JDK 17 — Android 빌드

## 설치

```bash
npm install
```

## 백엔드 의존성

이 앱은 기본적으로 `http://localhost:8000` 의 backend API 를 호출합니다.
별도 터미널에서 backend 를 먼저 띄우세요.

```bash
cd ../backend
docker compose up --build
```

다른 주소를 쓰려면 환경변수 `EXPO_PUBLIC_API_BASE` 로 덮어쓸 수 있어요.

```bash
EXPO_PUBLIC_API_BASE=http://192.168.0.10:8000 npm run web
```

> Android 에뮬레이터에서는 host 의 localhost 가 `10.0.2.2` 로 매핑돼서 자동 처리됩니다 (`constants/Config.ts`).

## 실행

```bash
npm run web        # 브라우저 (http://localhost:8081)
npm run ios        # iOS 시뮬레이터
npm run android    # Android 에뮬레이터
npm run start      # 메뉴에서 선택
```

> Drag&Drop 은 웹에서는 HTML5 native DnD, 모바일에서는 `react-native-gesture-handler` + `react-native-reanimated` 길게-눌러-드래그 (180ms) 로 동작합니다.

## 타입 체크

```bash
npx tsc --noEmit
```

## 폴더 구조

```
app/             # expo-router 라우트 (탭: timetable / index(Discover) / status)
components/      # UI 컴포넌트 — timetable / discover / status / ...
constants/       # 카테고리·subtopic·API base 등 디자인 토큰
hooks/           # useDnD 등 공용 hook
lib/api/         # backend client (client.ts, courses.ts, useApi.ts)
lib/mocks/       # statusFixture / timetableFixture / types — 점수·진척도 등 backend 가 아직 없는 부분
```
