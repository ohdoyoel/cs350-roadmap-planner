# Backend

이 폴더는 Roadmap Planner의 백엔드 작업 공간입니다.

## 기준 문서

- `docs/RoadmapPlanner SRS.pdf`: 원본 요구사항 문서
- `docs/workplan.md`: 현재 백엔드 작업 계획
- `docs/API.md`: 프론트엔드와 공유할 API 계약 초안
- `docs/tech-stack.md`: 백엔드 기술 스택과 개발 환경 구성
- `docs/gitcommit.md`: 커밋 메시지 작성 기준

## 개발 방향

백엔드는 SRS의 기능을 다음 순서로 구현합니다.

1. 과목정보 DB 설계 및 구성
2. Tree용 API 개발
3. Sidebar용 API 개발
4. User 정보 DB 설계 및 구성
5. 개발용 이메일 기반 로그인 API 개발
6. Semester Roadmap API 개발
7. Credit and GPA Calculator API 개발
8. 졸업요건 DB 설계 및 구성
9. 졸업요건 관련 API 개발
10. Settings API 개발
11. KAIST SSO 기반 정식 로그인 인증 구현
12. API 인증, 세션, 전송 보안 처리
13. 내보내기와 품질 보강

세부 범위는 `docs/workplan.md`의 마일스톤을 기준으로 합니다.
