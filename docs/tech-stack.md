# 기술 스택

이 문서는 Roadmap Planner 백엔드에서 사용할 기술 스택과 개발 환경 구성
방향을 정리합니다.

## Backend Framework

- FastAPI를 사용합니다.
- Python 기반으로 REST API를 구현합니다.
- API 문서는 `docs/API.md`를 기준으로 프론트엔드와 먼저 맞추고, 구현 중
  필요한 경우 FastAPI의 자동 문서를 보조적으로 활용합니다.

## Database

- MongoDB를 사용합니다.
- 과목정보, 유저별 정보, 졸업요건 기준 데이터를 MongoDB collection으로
  관리합니다.
- 졸업요건 데이터는 정책이 확정되기 전까지 변경 가능성을 고려해 유연한
  구조로 둡니다.

## Local Development

- API 서버와 MongoDB는 Docker Compose로 함께 실행합니다.
- 개발자는 별도 DB 설치 없이 compose 실행만으로 백엔드 개발 환경을 구성할
  수 있어야 합니다.
- compose 구성에는 최소한 다음 서비스를 둡니다.
  - `api`: FastAPI 서버
  - `mongo`: MongoDB

## Data Management Scripts

DB 초기 데이터 관리용 스크립트를 별도로 둡니다.

- `scripts/import-db.sh`: 파일에 저장된 데이터를 MongoDB에 넣습니다.
- `scripts/export-db.sh`: MongoDB의 현재 데이터를 파일로 내보냅니다.

주의할 점:
- 스크립트는 Docker Compose 서비스 이름을 기준으로 동작
- 일단 초기 개발 단계에서는 dummy 이메일을 사용하기 때문에, DB dump 전체를 공유하는 식으로 개발
- 추후 실제 이메일 인증/SSO 등의 기능이 추가되어 실제 유저 정보가 들어갈 때, DB 공유 방식에 대해서 추가 고려 (AWS 배포, MongoDB Atlas 등)

## Deployment

- 배포가 필요할 경우 AWS를 사용합니다.
- 초기에는 Docker Compose 기반 구성을 유지하고, 필요 시 AWS ECS, EC2, 또는
  유사한 컨테이너 실행 환경으로 옮길 수 있게 설계합니다.
- 배포 방식은 실제 서비스 범위와 운영 요구가 확정된 뒤 결정합니다.

## 현재 결정 사항 요약

| 영역 | 선택 |
| --- | --- |
| API 서버 | FastAPI |
| 언어 | Python |
| DB | MongoDB |
| 로컬 실행 | Docker Compose |
| 데이터 관리 | import/export shell script |
| 배포 | 필요 시 AWS |
