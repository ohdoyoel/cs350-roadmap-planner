# Backend API

현재 백엔드에 구현되어 있는 API 명세입니다.

| 항목 | 내용 |
| --- | --- |
| Base URL | `http://localhost:8000` |
| Swagger UI | `http://localhost:8000/docs` |
| 인증 | 사용자 기반 API는 Bearer session token 사용 |

## 공통 응답

| 상태 코드 | 설명 |
| --- | --- |
| `200` | 정상 응답 |
| `404` | 단일 리소스를 찾을 수 없음 |
| `422` | Query parameter, path parameter, request body 타입 검증 실패 |
| `500` | DB 연결 오류 등 예상하지 못한 서버 오류 |

## `GET /`

| 항목 | 내용 |
| --- | --- |
| 목적 | 백엔드 API 서버의 기본 응답 확인 |
| 인증 | 불필요 |
| Query Params | 없음 |
| Request Body | 없음 |

### Response `200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `message` | string | API 서버 기본 메시지 |

```json
{
  "message": "Roadmap Planner API"
}
```

## `GET /health`

| 항목 | 내용 |
| --- | --- |
| 목적 | FastAPI 서버 실행 상태 확인 |
| 인증 | 불필요 |
| Query Params | 없음 |
| Request Body | 없음 |

### Response `200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `status` | string | 서버 상태. 정상인 경우 `ok` |

```json
{
  "status": "ok"
}
```

## `GET /db/health`

| 항목 | 내용 |
| --- | --- |
| 목적 | FastAPI 서버와 MongoDB 연결 상태 확인 |
| 인증 | 불필요 |
| Query Params | 없음 |
| Request Body | 없음 |

### Response `200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `status` | string | DB 연결 상태. 정상인 경우 `ok` |

```json
{
  "status": "ok"
}
```

### Error

MongoDB 연결에 실패하면 `200` 응답을 반환하지 않습니다.

## `GET /courses`

| 항목 | 내용 |
| --- | --- |
| 목적 | 과목 목록 조회, 검색, 필터링, Tree용 선수과목 포함 조회 |
| 인증 | 불필요 |
| Request Body | 없음 |

### Query Params

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `q` | string | 아니오 | 과목코드, 한글 과목명, 영문 과목명 검색어 |
| `category` | string | 아니오 | 이수구분 필터. 예: `전공필수` |
| `sector` | string | 아니오 | 세부 분야 필터. 예: `전산이론` |
| `offeredSemester` | string | 아니오 | 개설 학기 필터. `S` 또는 `F` |
| `isKeyCourse` | boolean | 아니오 | 주요 과목 여부 필터 |
| `level` | integer | 아니오 | 과목번호 기반 레벨. 예: `100`, `200`, `300`, `400` |
| `includePrerequisites` | boolean | 아니오 | `true`이면 필터에 직접 매칭된 과목의 선수과목을 재귀적으로 포함 |

### Response `200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `[].id` | string | MongoDB document `_id`를 문자열로 변환한 값 |
| `[].courseCode` | string | 과목코드 |
| `[].courseName` | string | 한글 과목명 |
| `[].courseNameEn` | string \| null | 영문 과목명 |
| `[].description` | string \| null | 과목 설명 |
| `[].category` | string | 이수구분. 예: `전공필수` |
| `[].sectors` | string[] | 세부 분야 목록 |
| `[].offeredSemesters` | string[] | 개설 학기 목록. `S`, `F` |
| `[].credit.lecture` | integer | 강의 시간 |
| `[].credit.lab` | integer | 실험/실습 시간 |
| `[].credit.credit` | integer | 학점 |
| `[].credit.au` | integer | AU |
| `[].credit.raw` | string | 원본 학점 표기 |
| `[].prerequisites` | string[] | 선수과목 코드 목록 |
| `[].isKeyCourse` | boolean | 주요 과목 여부 |
| `[].level` | integer \| null | 과목코드에서 계산한 레벨 |
| `[].matched` | boolean | Query/filter 조건에 직접 매칭되었는지 여부 |

```json
[
  {
    "id": "69fae3ea250be2b98020f3d3",
    "courseCode": "CS300",
    "courseName": "알고리즘 개론",
    "courseNameEn": "Introduction to Algorithms",
    "description": null,
    "category": "전공필수",
    "sectors": ["전산이론"],
    "offeredSemesters": ["S", "F"],
    "credit": {
      "lecture": 3,
      "lab": 0,
      "credit": 3,
      "au": 0,
      "raw": "3:0:3(0)"
    },
    "prerequisites": ["CS204", "CS206"],
    "isKeyCourse": false,
    "level": 300,
    "matched": true
  }
]
```

`matched`가 `false`인 과목은 `includePrerequisites=true` 때문에 선수과목으로 추가 포함된 과목입니다.

조건에 맞는 과목이 없으면 `200 []`를 반환합니다.

### Examples

```text
GET /courses?q=algorithm
GET /courses?category=전공필수
GET /courses?sector=인공지능/정보서비스
GET /courses?isKeyCourse=true
GET /courses?level=300
GET /courses?sector=인공지능/정보서비스&includePrerequisites=true
```

## `POST /auth/signup`

| 항목 | 내용 |
| --- | --- |
| 목적 | KAIST 이메일 기반 사용자 생성 및 인증 메일 발송 |
| 인증 | 불필요 |
| Query Params | 없음 |

### Request Body

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `email` | string | 예 | `@kaist.ac.kr` 이메일 |
| `password` | string | 예 | 평문 저장 없이 salt와 pepper를 적용해 해시로 저장할 비밀번호 |
| `name` | string \| null | 아니오 | 사용자 이름 |
| `graduationYear` | integer \| null | 아니오 | 졸업 예정 연도 |

```json
{
  "email": "student@kaist.ac.kr",
  "password": "secure-password",
  "name": "Student",
  "graduationYear": 2027
}
```

### Response `200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `kaistEmail` | string | 인증 메일을 보낸 KAIST 이메일 |
| `emailSent` | boolean | 인증 메일 발송 여부 |
| `message` | string | 처리 결과 메시지 |

```json
{
  "kaistEmail": "student@kaist.ac.kr",
  "emailSent": true,
  "message": "Verification email sent"
}
```

가입 직후 사용자는 `emailVerified=false` 상태입니다. 이메일의 인증 링크를 클릭해 인증을 완료한 뒤 `/auth/login`으로 세션을 발급받습니다.

인증 메일 발송은 SMTP를 사용합니다. Gmail로 테스트할 때는 `.env`에 `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USE_SSL=true`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `EMAIL_VERIFICATION_BASE_URL=http://localhost:8000`을 설정합니다.

## `GET /auth/verify-email`

| 항목 | 내용 |
| --- | --- |
| 목적 | 이메일 인증 링크 클릭 처리 |
| 인증 | 불필요 |
| Request Body | 없음 |

### Query Params

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `token` | string | 예 | 인증 메일에 포함된 원문 토큰 |

성공하면 `emailVerified=true`로 변경하고 간단한 HTML 성공 화면을 반환합니다. 토큰이 없거나 만료/사용/위조된 경우 HTML 실패 화면을 반환합니다.

## `POST /auth/resend-verification`

| 항목 | 내용 |
| --- | --- |
| 목적 | 미인증 사용자에게 인증 메일 재발송 |
| 인증 | 불필요 |

### Request Body

```json
{
  "email": "student@kaist.ac.kr"
}
```

### Response `200`

`POST /auth/signup`과 같은 응답을 반환합니다.

### Error

KAIST 이메일이 아니면 `422`, 이미 가입된 이메일이면 `409`를 반환합니다.

```json
{
  "detail": "User already exists"
}
```

## `POST /auth/login`

| 항목 | 내용 |
| --- | --- |
| 목적 | 기존 KAIST 이메일 사용자 로그인 세션 발급 |
| 인증 | 불필요 |
| Query Params | 없음 |

### Request Body

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `email` | string | 예 | 가입된 `@kaist.ac.kr` 이메일 |
| `password` | string | 예 | 가입 시 설정한 비밀번호 |

```json
{
  "email": "student@kaist.ac.kr",
  "password": "secure-password"
}
```

### Response `200`

`POST /auth/signup`과 같은 세션 응답을 반환합니다.

### Error

KAIST 이메일이 아니면 `422`, 이메일 또는 비밀번호가 틀리면 `401`을 반환합니다.

```json
{
  "detail": "Invalid email or password"
}
```

## `GET /me`

| 항목 | 내용 |
| --- | --- |
| 목적 | Bearer token 기준 현재 사용자 정보 조회 |
| 인증 | 필요 |
| Query Params | 없음 |
| Request Body | 없음 |

### Headers

```http
Authorization: Bearer <sessionToken>
```

### Response `200`

현재 사용자 기본 정보와 settings 객체를 함께 반환합니다.

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Student",
  "kaistEmail": "student@kaist.ac.kr",
  "createdAt": "2026-05-11T12:00:00Z",
  "updatedAt": "2026-05-11T12:00:00Z",
  "settings": {
    "id": "607f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439011",
    "language": "ko",
    "theme": "system",
    "academicOption": "major",
    "graduationYear": 2027
  }
}
```

### Error

session token이 없거나 유효하지 않으면 `401`을 반환합니다.

## `PATCH /me/academic-option`

| 항목 | 내용 |
| --- | --- |
| 목적 | 현재 사용자의 전공 구분 수정 |
| 인증 | 필요 |
| Query Params | 없음 |
| Request Body | 변경할 `academicOption` |

### Headers

```http
Authorization: Bearer <sessionToken>
```

### Request Body

```json
{
  "academicOption": "double_major"
}
```

`academicOption`은 `major`, `minor`, `double_major` 중 하나이며, 이 endpoint에서 변경할 수 있는 유일한 값입니다.

### Response `200`

수정 후 `SettingsDTO`를 반환합니다.

```json
{
  "id": "607f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439011",
  "language": "ko",
  "theme": "system",
  "academicOption": "double_major",
  "graduationYear": 2027
}
```

## `DELETE /me`

| 항목 | 내용 |
| --- | --- |
| 목적 | 현재 로그인한 사용자 계정 탈퇴 |
| 인증 | 필요 |
| Query Params | 없음 |
| Request Body | 없음 |

### Headers

```http
Authorization: Bearer <sessionToken>
```

### Response `204`

응답 본문 없이 현재 사용자 계정을 삭제합니다. 관련 `settings`, `roadmap`, `auth_sessions`, `email_verifications`도 함께 삭제합니다.

### Error

session token이 없거나 유효하지 않으면 `401`을 반환합니다.

## `POST /auth/logout`

| 항목 | 내용 |
| --- | --- |
| 목적 | 현재 session token 무효화 |
| 인증 | 필요 |
| Query Params | 없음 |
| Request Body | 없음 |

### Headers

```http
Authorization: Bearer <sessionToken>
```

### Response `204`

응답 본문 없이 현재 세션을 종료합니다.

### Error

session token이 없거나 유효하지 않으면 `401`을 반환합니다.

## `GET /courses/{courseCode}`

| 항목 | 내용 |
| --- | --- |
| 목적 | 선택한 과목의 상세 정보 조회 |
| 인증 | 불필요 |
| Query Params | 없음 |
| Request Body | 없음 |

### Path Params

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `courseCode` | string | 예 | 과목코드. 예: `CS300` |

### Response `200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | string | MongoDB document `_id`를 문자열로 변환한 값 |
| `courseCode` | string | 과목코드 |
| `courseName` | string | 한글 과목명 |
| `courseNameEn` | string \| null | 영문 과목명 |
| `description` | string \| null | 과목 설명 |
| `category` | string | 이수구분 |
| `sectors` | string[] | 세부 분야 목록 |
| `offeredSemesters` | string[] | 개설 학기 목록 |
| `credit` | object | 학점 정보 |
| `prerequisites` | string[] | 선수과목 코드 목록 |
| `isKeyCourse` | boolean | 주요 과목 여부 |
| `level` | integer \| null | 과목코드에서 계산한 레벨 |
| `matched` | boolean | 상세 조회에서는 항상 `true` |

```json
{
  "id": "69fae3ea250be2b98020f3d3",
  "courseCode": "CS300",
  "courseName": "알고리즘 개론",
  "courseNameEn": "Introduction to Algorithms",
  "description": null,
  "category": "전공필수",
  "sectors": ["전산이론"],
  "offeredSemesters": ["S", "F"],
  "credit": {
    "lecture": 3,
    "lab": 0,
    "credit": 3,
    "au": 0,
    "raw": "3:0:3(0)"
  },
  "prerequisites": ["CS204", "CS206"],
  "isKeyCourse": false,
  "level": 300,
  "matched": true
}
```

### Error

과목이 없으면 `404`를 반환합니다.

```json
{
  "detail": "Course not found"
}
```

## `GET /courses/categories`

| 항목 | 내용 |
| --- | --- |
| 목적 | 과목 이수구분 목록 조회 |
| 인증 | 불필요 |
| Query Params | 없음 |
| Request Body | 없음 |

### Response `200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `[].category` | string | 이수구분 |
| `[].nameEn` | string | 이수구분 영문명 |
| `[].order` | integer | 표시 순서 |
| `[].courseCount` | integer | 해당 이수구분에 속한 과목 수 |

```json
[
  {
    "category": "전공필수",
    "nameEn": "Major Required",
    "order": 3,
    "courseCount": 6
  }
]
```

## `GET /courses/sectors`

| 항목 | 내용 |
| --- | --- |
| 목적 | 과목 세부 분야 목록 조회 |
| 인증 | 불필요 |
| Query Params | 없음 |
| Request Body | 없음 |

### Response `200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `[].sector` | string | 세부 분야 |
| `[].nameEn` | string | 세부 분야 영문명 |
| `[].order` | integer | 표시 순서 |
| `[].courseCount` | integer | 해당 세부 분야에 속한 과목 수 |

```json
[
  {
    "sector": "전산이론",
    "nameEn": "Theory",
    "order": 3,
    "courseCount": 13
  }
]
```

## `GET /examples`

| 항목 | 내용 |
| --- | --- |
| 목적 | DB 연결 및 Beanie 동작 확인용 example document 목록 조회 |
| 인증 | 불필요 |
| Query Params | 없음 |
| Request Body | 없음 |

### Response `200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `[].id` | string | MongoDB document `_id`를 문자열로 변환한 값 |
| `[].name` | string | example 이름 |
| `[].created_at` | string | document 생성 시각 |

```json
[
  {
    "id": "69f88a3cabd7ac04b68c43bc",
    "name": "from-api",
    "created_at": "2026-05-04T11:59:56.677000"
  }
]
```

## `POST /examples`

| 항목 | 내용 |
| --- | --- |
| 목적 | DB 연결 및 Beanie insert 동작 확인용 example document 생성 |
| 인증 | 불필요 |
| Query Params | 없음 |

### Request Body

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `name` | string | 예 | example 이름 |

```json
{
  "name": "from-api"
}
```

### Response `200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | string | MongoDB document `_id`를 문자열로 변환한 값 |
| `name` | string | example 이름 |
| `created_at` | string | document 생성 시각 |

```json
{
  "id": "69f88a3cabd7ac04b68c43bc",
  "name": "from-api",
  "created_at": "2026-05-04T11:59:56.677000"
}
```

## Roadmap API

Roadmap API는 로그인한 사용자 자신의 학기별 과목 배치 상태를 관리합니다. 모든 endpoint는 Bearer session token 인증이 필요합니다.

### 공통 개념

| 이름 | 설명 |
| --- | --- |
| `semester` | API 외부에서는 `"1-1"`, `"1-2"`, `"2-1"` 형식의 문자열로 주고받습니다. 서버 내부와 DB에는 `1`, `2`, `3` 같은 정수 semester number로 저장합니다. |
| `courseCode` | 과목 코드입니다. 서버 저장 시 대문자로 정규화합니다. |
| `grade` | `PLANNED`, `A+`, `A0`, `A-`, `B+`, `B0`, `B-`, `C+`, `C0`, `C-`, `D+`, `D0`, `D-`, `F`, `S`, `U` 중 하나입니다. |
| 과목 식별자 | roadmap 안의 과목은 `courseCode`로 식별합니다. 같은 roadmap 안에 같은 `courseCode`를 중복 배치할 수 없습니다. 재수강은 기존 과목 배치를 이동/수정하는 방식으로 처리합니다. |

### `GET /roadmap/me`

현재 로그인한 사용자의 roadmap을 조회합니다. 사용자의 roadmap이 아직 없으면 빈 roadmap을 생성해서 반환합니다.

#### Response `200`

```json
{
  "id": "665000000000000000000001",
  "userId": "665000000000000000000002",
  "currentSemester": "1-1",
  "courses": [
    {
      "type": "catalog",
      "semester": "2-1",
      "courseCode": "CS350",
      "grade": "PLANNED"
    }
  ],
  "warnings": [
    {
      "courseCode": "CS350",
      "requiredCourseCode": "CS206"
    }
  ],
  "createdAt": "2026-05-23T13:19:10.525Z",
  "updatedAt": "2026-05-23T13:19:10.525Z"
}
```

`warnings`는 roadmap 저장 상태에서 선수과목 순서 문제가 있는 과목 목록입니다. `requiredCourseCode`가 roadmap에 없거나, `courseCode`와 같은 학기 또는 더 늦은 학기에 배치되어 있으면 warning에 포함됩니다.

### `PATCH /roadmap/me/current-semester`

현재 학기를 변경합니다.

#### Query Params

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `semester` | string | 예 | 현재 학기. 예: `2-1` |

#### Example

```http
PATCH /roadmap/me/current-semester?semester=2-1
Authorization: Bearer <sessionToken>
```

#### Response `200`

수정 후 전체 `RoadmapDTO`를 반환합니다.

### `POST /roadmap/me/courses`

roadmap에 과목을 추가합니다.

#### Request Body: catalog course

```json
{
  "type": "catalog",
  "semester": "2-1",
  "courseCode": "CS350",
  "grade": "PLANNED"
}
```

`type = "catalog"`인 경우 `courseCode`는 `courses` 컬렉션에 존재해야 합니다. 존재하지 않으면 `404`를 반환합니다.

#### Request Body: custom course

Custom course를 위한 shape도 schema에 포함되어 있습니다.

```json
{
  "type": "custom",
  "semester": "3-1",
  "courseCode": "CUSTOM001",
  "title": "Exchange Course",
  "credit": 3,
  "category": "전공선택",
  "grade": "PLANNED"
}
```

#### Response `200`

추가 후 전체 `RoadmapDTO`를 반환합니다.

#### Error

| 상태 코드 | 설명 |
| --- | --- |
| `404` | catalog course가 `courses` 컬렉션에 없음 |
| `409` | 같은 roadmap에 같은 `courseCode`가 이미 있음 |

### `POST /roadmap/me/courses/move`

과목을 다른 학기로 이동합니다.

#### Query Params

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `courseCode` | string | 예 | 이동할 과목 코드 |
| `fromSemester` | string | 예 | 기존 학기. 예: `2-1` |
| `toSemester` | string | 예 | 이동할 학기. 예: `3-1` |

#### Example

```http
POST /roadmap/me/courses/move?courseCode=CS350&fromSemester=2-1&toSemester=3-1
Authorization: Bearer <sessionToken>
```

#### Response `200`

이동 후 전체 `RoadmapDTO`를 반환합니다.

### `PATCH /roadmap/me/courses/{semester}/{courseCode}/grade`

특정 학기에 배치된 과목의 성적을 변경합니다.

#### Path Params

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `semester` | string | 과목이 배치된 학기. 예: `2-1` |
| `courseCode` | string | 과목 코드 |

#### Query Params

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `grade` | string | 예 | 변경할 성적 |

#### Example

```http
PATCH /roadmap/me/courses/2-1/CS350/grade?grade=A0
Authorization: Bearer <sessionToken>
```

#### Response `200`

수정 후 전체 `RoadmapDTO`를 반환합니다.

### `DELETE /roadmap/me/courses/{semester}/{courseCode}`

특정 학기에 배치된 과목을 삭제합니다.

#### Example

```http
DELETE /roadmap/me/courses/2-1/CS350
Authorization: Bearer <sessionToken>
```

#### Response `200`

삭제 후 전체 `RoadmapDTO`를 반환합니다.

## Credit and GPA API

Credit and GPA API는 roadmap을 기반으로 현재 학기 기준 학점, GPA, 졸업요건 진행 상황을 계산합니다. 계산 결과는 DB에 저장하지 않고 요청 시점에 산출합니다.

### `GET /credit-gpa/me`

현재 로그인한 사용자의 roadmap을 읽고, catalog course metadata와 조합해서 학점/GPA 요약을 반환합니다.

#### Response `200`

```json
{
  "currentSemester": "2-1",
  "academicOption": "major",
  "credits": {
    "completed": 33,
    "inProgress": 15,
    "remaining": 27
  },
  "gpa": 3.61,
  "requirements": [
    {
      "key": "basic",
      "label": "기초",
      "requiredCredits": 6,
      "completedCredits": 3,
      "inProgressCredits": 3,
      "remainingCredits": 0
    },
    {
      "key": "major_required",
      "label": "전공필수",
      "requiredCredits": 19,
      "completedCredits": 12,
      "inProgressCredits": 3,
      "remainingCredits": 4
    },
    {
      "key": "major_elective",
      "label": "전공선택",
      "requiredCredits": 30,
      "completedCredits": 9,
      "inProgressCredits": 6,
      "remainingCredits": 15
    },
    {
      "key": "graduation_research",
      "label": "졸업연구",
      "requiredCredits": 3,
      "completedCredits": 0,
      "inProgressCredits": 0,
      "remainingCredits": 3
    }
  ],
  "courses": [
    {
      "key": "basic",
      "label": "기초",
      "items": [
        {
          "type": "catalog",
          "courseCode": "CS101",
          "title": "Intro CS",
          "titleEn": "Introduction to Computer Science",
          "semester": "1-1",
          "category": "기초필수",
          "credit": 3,
          "grade": "A0",
          "status": "completed"
        }
      ]
    },
    {
      "key": "major_required",
      "label": "전공필수",
      "items": []
    },
    {
      "key": "major_elective",
      "label": "전공선택",
      "items": [
        {
          "type": "catalog",
          "courseCode": "CS350",
          "title": "Software Engineering",
          "titleEn": "Introduction to Software Engineering",
          "semester": "2-1",
          "category": "전공선택",
          "credit": 3,
          "grade": "PLANNED",
          "status": "in_progress"
        }
      ]
    },
    {
      "key": "graduation_research",
      "label": "졸업연구",
      "items": []
    }
  ]
}
```

#### Field notes

| 필드 | 설명 |
| --- | --- |
| `credits.completed` | 현재 학기 이전에 완료된 것으로 처리되는 학점 합계 |
| `credits.inProgress` | 현재 학기에 배치된 과목 학점 합계 |
| `credits.remaining` | 4개 requirement의 `remainingCredits` 합계 |
| `gpa` | GPA 계산 대상 과목이 없으면 `null` |
| `requirements` | 기초, 전공필수, 전공선택, 졸업연구 4개 고정 |
| `courses` | 같은 4개 그룹으로 나뉜 전체 roadmap course 목록 |

#### Course status

| status | 의미 |
| --- | --- |
| `completed` | 현재 학기 이전 과목이고 성적이 입력됨 |
| `missing_grade` | 현재 학기 이전 과목이지만 `grade = PLANNED`. 이수 학점에는 포함하고 GPA에서는 제외함 |
| `in_progress` | 현재 학기 과목 |
| `planned` | 현재 학기 이후 과목 |
