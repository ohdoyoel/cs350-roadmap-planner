# Frontend

Roadmap Planner 프론트엔드 작업 공간입니다. Expo SDK 54 + `expo-router` + TypeScript 기반이며 웹과 iOS/Android에서 동일한 코드로 동작합니다.

## 필요 환경

- Node.js 20 이상 (권장: fnm 또는 nvm으로 관리)
- npm 10 이상
- (iOS 빌드 시) Xcode + CocoaPods
- (Android 빌드 시) Android Studio + Android SDK

## 설치

`frontend` 폴더에서 의존성을 설치합니다.

```bash
cd frontend
npm install
```

## 실행

| 플랫폼 | 명령 | 비고 |
| --- | --- | --- |
| 웹 | `npm run web` | 기본 포트 8081. `http://localhost:8081` 에서 확인. 데스크톱 브라우저에서는 400×844 폰 프레임 안에 렌더됩니다. |
| iOS | `npm run ios` | 네이티브 빌드 필요. iOS 시뮬레이터가 자동으로 열립니다. |
| Android | `npm run android` | 네이티브 빌드 필요. 에뮬레이터 또는 USB 연결된 기기가 필요합니다. |
| 메뉴 | `npm start` | Metro Bundler가 시작되고 키 입력으로 플랫폼을 선택할 수 있습니다. |

서버 중지는 실행 중인 터미널에서 `Ctrl + C`.

## 웹 정적 빌드

```bash
npx expo export --platform web
```

위 명령 실행 결과는 `frontend/dist/` 폴더에 정적 HTML/JS/CSS로 떨어집니다. Vercel, Cloudflare Pages, Netlify 등에 그대로 업로드 가능합니다.

## 디렉토리 구조

```text
frontend/
  app/              # expo-router 라우트 (파일 기반 라우팅)
    _layout.tsx       # SafeAreaProvider + PhoneFrame + Sidebar overlay
    (tabs)/           # bottom tab 라우트 그룹 (timetable / discover / status)
    settings.tsx      # Stack 라우트
  components/       # 공통 UI 컴포넌트
    icons/            # SVG 아이콘 (MenuIcon, CalendarIcon, ...)
    status/           # Status 탭 전용 컴포넌트
  constants/        # 디자인 토큰 (Categories, Subtopics, GraduationRequirements)
  lib/              # 도메인 타입, mock fixture, sidebar context
  assets/           # 아이콘/스플래시 이미지
```

## 관련 문서

- `../docs/RoadmapPlanner SRS.pdf`: 원본 요구사항 문서
- `../docs/카이스트_전산학부_학부_로드맵_(학사과정용.)_.pdf`: 커리큘럼 reference
- `../docs/gitcommit.md`: 커밋 메시지 규칙
