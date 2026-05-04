# Backend API 초안

이 문서는 프론트엔드와 백엔드가 공유할 API 계약 초안입니다. 실제 구현 중
변경될 수 있으며, 변경 시 이 문서를 함께 갱신합니다.

## 작성 기준

- Swagger/OpenAPI 문서가 아니라 사람이 읽는 API 공유 문서입니다.
- 엔드포인트 이름은 구현 전 초안입니다.
- 인증이 필요한 API는 개발용 이메일 로그인 단계에서는 임시 세션을 사용하고,
  이후 KAIST SSO 기반 인증혹은 이메일 인증 방법으로 교체합니다.
- 응답 필드명은 프론트엔드와 협의하면서 확정합니다.

## API 양식

### 과목 목록 조회

| 항목 | 내용 |
| --- | --- |
| Method | `GET` |
| URL | `/courses` |
| 인증 | 불필요 |
| 사용 화면 | Tree, Sidebar |
| 목적 | 과목 목록을 검색하거나 필터링해서 조회합니다. |

요청 Query

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `q` | 아니오 | 과목명 또는 과목 코드 검색어 |
| `category` | 아니오 | 과목 카테고리 |
| `topic` | 아니오 | 세부 분야 |

응답 Body

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `courses` | array | 과목 목록 |
| `courses[].code` | string | 과목 코드 |
| `courses[].title` | string | 과목명 |
| `courses[].credits` | number | 학점 |
| `courses[].category` | string | 과목 카테고리 |
| `courses[].topic` | string | 세부 분야 |

비고

- 구현 전 초안이므로 URL과 필드명은 프론트엔드와 협의 후 변경될 수 있습니다.
