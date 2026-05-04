# Backend API

현재 백엔드에 구현되어 있는 API 명세입니다.

| 항목 | 내용 |
| --- | --- |
| Base URL | `http://localhost:8000` |
| Swagger UI | `http://localhost:8000/docs` |
| 인증 | 현재 구현된 API는 인증을 사용하지 않음 |

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

MongoDB 연결이 실패하면 `200` 응답을 반환하지 않습니다.

## `GET /examples`

| 항목 | 내용 |
| --- | --- |
| 목적 | DB 연결 및 Beanie 동작 확인을 위한 임시 example document 목록 조회 |
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
| 목적 | DB 연결 및 Beanie insert 동작 확인을 위한 임시 example document 생성 |
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

## 비고

- `/examples` API는 실제 서비스 기능이 아니라 초기 DB 연결 테스트용 API입니다.
- 실제 Roadmap Planner 기능 API가 추가되면 이 문서를 함께 갱신합니다.
