# Backend API

현재 백엔드에 구현되어 있는 API 명세입니다.

| 항목 | 내용 |
| --- | --- |
| Base URL | `http://localhost:8000` |
| Swagger UI | `http://localhost:8000/docs` |
| 인증 | 현재 구현된 API는 인증을 사용하지 않음 |

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
