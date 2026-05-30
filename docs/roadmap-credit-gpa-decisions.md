# Roadmap and Credit/GPA design decisions

이 문서는 Roadmap API와 Credit/GPA API를 구현하면서 합의한 설계 결정을 정리한다. 코드 위치는 backend 기준으로 다음과 같다.

- DB model: `src/db/models/roadmap.py`
- Roadmap API: `src/fastapi_app/routers/roadmaps.py`, `src/fastapi_app/services/roadmaps.py`, `src/fastapi_app/schemas/roadmaps.py`
- Credit/GPA API: `src/fastapi_app/routers/credit_gpa.py`, `src/fastapi_app/services/credit_gpa.py`, `src/fastapi_app/schemas/credit_gpa.py`

## Roadmap document shape

Roadmap은 사용자별 단일 document로 관리한다.

```ts
roadmaps
- _id
- user_id
- current_semester_number
- courses[]
  - type: "catalog"
    semester_number
    course_code
    grade

  - type: "custom"
    semester_number
    course_code
    title
    credit
    category
    grade
- created_at
- updated_at
```

결정 사항:

- `title`은 저장하지 않는다. 현재 요구사항은 사용자별 기본 roadmap 1개이므로 여러 roadmap 이름이 필요하지 않다.
- `semesters[]` 배열을 두지 않는다. 학기 자체에 별도 상태가 없으므로 각 course item에 `semester_number`를 직접 둔다.
- `max_semester_number`를 두지 않는다. 빈 초과학기 저장은 현재 API 목적에 비해 과하다.
- `candidate_courses[]`를 두지 않는다. 후보/장바구니 상태는 프론트가 관리한다.
- 사용자별 roadmap은 1개만 만든다. DB index는 `user_id` unique이다.

## Catalog course and custom course

`courses[]`는 MongoDB embedded document 배열이고, `type` discriminator로 두 형태를 구분한다.

```ts
type = "catalog"
  course_code로 courses collection을 참조한다.

type = "custom"
  roadmap item 안에 title, credit, category를 직접 저장한다.
```

이 구조를 선택한 이유:

- MongoDB에서는 같은 배열 안에 shape이 다른 object를 저장할 수 있다.
- FastAPI/Pydantic에서는 `type` discriminator로 validation을 강하게 걸 수 있다.
- catalog 과목은 공식 course catalog의 학점/카테고리를 사용하고, custom 과목은 item 내부 값을 사용하면 된다.

현재 milestone에서는 catalog course가 주 대상이다. Custom shape은 나중 확장을 위해 열어둔 구조다.

## Course identity

Roadmap 안에서 과목 item의 식별자는 별도 `roadmap_course_id`가 아니라 다음 조합이다.

```txt
course_code
```

결정 이유:

- 같은 roadmap 안에 같은 `course_code`를 중복 배치할 수 없으므로 roadmap 전체에서 `course_code` 중복을 금지한다.
- 재수강은 기존 과목 배치를 이동/수정하는 방식으로 처리한다.
- 이동, 삭제, 성적 변경 API는 모두 기존 학기와 course code로 특정 item을 찾는다.

예:

```http
DELETE /roadmap/me/courses/2-1/CS350
PATCH /roadmap/me/courses/2-1/CS350/grade?grade=A0
```

## Prerequisite warnings

`RoadmapDTO`는 현재 roadmap 상태의 선수과목 경고를 `warnings`로 함께 반환한다.

```json
{
  "courseCode": "CS350",
  "requiredCourseCode": "CS206"
}
```

경고 조건:

- `requiredCourseCode`가 roadmap에 배치되어 있지 않다.
- `requiredCourseCode`가 `courseCode`와 같은 학기 또는 더 늦은 학기에 배치되어 있다.

경고는 저장을 막지 않는다. `POST /roadmap/me/courses`, `POST /roadmap/me/courses/move`, `DELETE /roadmap/me/courses/{semester}/{courseCode}` 등 roadmap을 반환하는 API는 저장 후 상태를 기준으로 같은 warning 구조를 내려준다.

## Semester representation

API 외부와 프론트에서는 학기를 `"1-1"`, `"1-2"`, `"2-1"` 형식의 문자열로 주고받는다.

DB와 service 내부에서는 정수 `semester_number`로 저장한다.

```txt
1 -> 1-1
2 -> 1-2
3 -> 2-1
4 -> 2-2
```

변환식:

```py
academic_year = (semester_number - 1) // 2 + 1
academic_term = 1 if semester_number % 2 == 1 else 2

semester_number = (academic_year - 1) * 2 + academic_term
```

결정 이유:

- DB에는 정렬과 비교가 쉬운 정수를 저장한다.
- API는 프론트와 사용자에게 자연스러운 `"학년-학기"` label을 노출한다.
- `start_year`, `start_term`, 실제 calendar year는 현재 UI 목적에 필요하지 않다.

Swagger/OpenAPI는 내부 타입만 보면 integer로 표시하므로 `WithJsonSchema`를 사용해 `semester`가 string example으로 보이게 했다.

## Grade values

Roadmap course의 `grade`는 다음 enum 중 하나다.

```txt
PLANNED
A+, A0, A-
B+, B0, B-
C+, C0, C-
D+, D0, D-
F
S
U
```

의미:

- `PLANNED`: 아직 성적이 입력되지 않은 상태.
- `S`, `U`: GPA에는 포함하지 않는 pass/fail 계열 성적이다.

## Course status policy

Credit/GPA API는 `current_semester_number`를 기준으로 course status를 계산한다.

| 조건 | status | 계산 정책 |
| --- | --- | --- |
| `semester_number = current_semester_number` | `in_progress` | 현재 수강중 학점으로 계산 |
| `semester_number > current_semester_number` | `planned` | 현재 학점/요건 계산에는 포함하지 않음 |
| `semester_number < current_semester_number` and `grade = PLANNED` | `missing_grade` | 이수 학점과 요건에는 포함, GPA에는 제외 |
| `semester_number < current_semester_number` and grade entered | `completed` | 이수 학점과 요건에 포함. letter grade면 GPA에도 포함 |

중요한 결정:

- 과거 학기의 `PLANNED`는 실제로는 성적 미입력 상태로 본다.
- 따라서 status는 `missing_grade`로 표시하지만, 이미 들은 학점으로 처리한다.
- 단, 성적 점수가 없으므로 GPA에서는 제외한다.

## GPA policy

GPA는 `completed` 상태의 letter grade 과목만 계산한다.

점수표:

```txt
A+ 4.3
A0 4.0
A- 3.7
B+ 3.3
B0 3.0
B- 2.7
C+ 2.3
C0 2.0
C- 1.7
D+ 1.3
D0 1.0
D- 0.7
F  0.0
```

제외:

- `PLANNED`
- `S`
- `U`
- `missing_grade`
- `in_progress`
- `planned`

GPA 대상 학점이 없으면 `gpa`는 `null`이다.

## Credit summary policy

`GET /credit-gpa/me`의 상단 `credits`는 다음 3개만 제공한다.

```json
{
  "completed": 33,
  "inProgress": 15,
  "remaining": 27
}
```

의미:

- `completed`: 현재 학기 이전에 완료된 것으로 처리되는 학점 합계.
- `inProgress`: 현재 학기 과목 학점 합계.
- `remaining`: 4개 졸업요건의 `remainingCredits` 합계.

미래 학기 planned 학점은 상단 summary에 넣지 않는다. 현재 UI 목적은 “들은 학점 / 듣고 있는 학점 / 들어야 하는 학점” 표시이기 때문이다.

## Requirement groups

Credit/GPA API는 졸업요건과 과목 목록을 항상 4개 그룹으로 반환한다.

| key | label | requiredCredits |
| --- | --- | --- |
| `basic` | `기초` | 6 |
| `major_required` | `전공필수` | 19 |
| `major_elective` | `전공선택` | 30 |
| `graduation_research` | `졸업연구` | 3 |

`satisfied`, `plannedSatisfied` 같은 boolean은 내려주지 않는다. 프론트는 `requiredCredits`, `completedCredits`, `inProgressCredits`, `remainingCredits`를 보고 판단할 수 있다.

## Category mapping

Catalog course category는 다음처럼 4개 requirement key로 매핑한다.

| course category | requirement key |
| --- | --- |
| `기초필수` | `basic` |
| `기초선택` | `basic` |
| `전공필수` | `major_required` |
| `전공선택` | `major_elective` |
| `졸업연구` | `graduation_research` |

Custom course도 나중에 열면 프론트에서 반드시 이 4개 그룹 중 하나로 선택하게 한다. 분석 API에서는 4개 그룹만 안정적으로 내려주는 것을 목표로 한다.

## Basic requirement special rule

기초 요건은 단순 category 합산이 아니다.

현재 결정한 기초 요건:

```txt
CS101 3학점
MAS109 또는 MAS110 중 하나 3학점
총 6학점
```

정책:

- `CS101`을 완료 또는 현재 수강중이면 3학점 인정.
- `MAS109`, `MAS110` 중 하나를 완료 또는 현재 수강중이면 3학점 인정.
- `MAS109`와 `MAS110`을 둘 다 들어도 3학점만 인정한다.
- 완료가 현재 수강중보다 우선한다.

예:

```txt
MAS109 completed, MAS110 completed -> 3학점
MAS109 in_progress, MAS110 planned -> inProgress 3학점
MAS109 planned only -> 현재 기준 인정하지 않음
```

## Major/research requirement policy

다음 요건은 category 합산으로 계산한다.

- 전공필수: `category = 전공필수`
- 전공선택: `category = 전공선택`
- 졸업연구: `category = 졸업연구`

각 요건의 부족 학점:

```txt
remainingCredits = max(0, requiredCredits - completedCredits - inProgressCredits)
```

미래 planned 과목은 `remainingCredits` 계산에 포함하지 않는다.

## API split

Roadmap CRUD와 Credit/GPA 계산은 router, service, schema를 분리한다.

Roadmap API:

```txt
GET    /roadmap/me
PATCH  /roadmap/me/current-semester
POST   /roadmap/me/courses
POST   /roadmap/me/courses/move
PATCH  /roadmap/me/courses/{semester}/{courseCode}/grade
DELETE /roadmap/me/courses/{semester}/{courseCode}
```

Credit/GPA API:

```txt
GET /credit-gpa/me
```

분리 이유:

- Roadmap API는 저장된 사용자 계획 상태를 변경한다.
- Credit/GPA API는 roadmap과 course catalog를 읽어서 계산 결과를 반환한다.
- 계산 결과는 저장하지 않는다.

## Response grouping

`GET /credit-gpa/me`의 `courses`는 flat list가 아니라 4개 group으로 반환한다.

```json
[
  {
    "key": "basic",
    "label": "기초",
    "items": []
  },
  {
    "key": "major_required",
    "label": "전공필수",
    "items": []
  },
  {
    "key": "major_elective",
    "label": "전공선택",
    "items": []
  },
  {
    "key": "graduation_research",
    "label": "졸업연구",
    "items": []
  }
]
```

비어 있는 그룹도 항상 내려준다. 프론트가 섹션 순서를 고정해서 렌더링하기 쉽게 하기 위해서다.

## Test policy

Roadmap과 Credit/GPA 테스트는 파일을 분리한다.

- `src/tests/test_roadmap_service.py`: roadmap CRUD, semester label, roadmap API integration.
- `src/tests/test_creditgpa_service.py`: credit/GPA 계산, requirement 계산, credit-gpa API integration.

Integration test는 기본적으로 skip된다. 실행하려면 다음 환경변수가 필요하다.

```powershell
$env:RUN_INTEGRATION_TESTS = "1"
$env:TEST_MONGODB_DATABASE = "roadmap_planner_test"
uv run python -m unittest discover src/tests
```

`TEST_MONGODB_DATABASE`는 반드시 `_test`로 끝나야 하며, 테스트 중 관련 collection을 비운다.
