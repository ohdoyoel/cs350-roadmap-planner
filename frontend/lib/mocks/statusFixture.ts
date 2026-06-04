// SRS Figure 1·2·3 (Status / GPA Calculator) 화면에서 쓰는 타입과 정적 메타.
// 사용자별 수치는 GET /credit-gpa/me 에서 받아 매핑한다.

import type { CategoryId, Grade } from '@/lib/mocks/types';

export type SemesterOption = {
  id: string;
  label: string;
};

export type StatSummary = {
  earnedCredits: number;
  totalRequiredCredits: number;
  plannedCredits: number;
  plannedAdditionalCredits: number;
  cumulativeGpa: number;
  remainingCredits: number;
};

export type RequirementGroupId =
  | 'required_major'
  | 'elective_major'
  | 'other_requirements'
  | 'graduation_research'
  | 'major_total'
  | 'capstone';

export type RequirementGroup = {
  id: RequirementGroupId;
  label_ko: string;
  label_en: string;
  earned: number;
  required: number;
  planned: number;
};

export type FilterChipId = 'all' | CategoryId | 'graduation_research' | 'custom';

export const FILTER_CHIPS: { id: FilterChipId; label_ko: string; label_en: string }[] = [
  { id: 'all', label_ko: '전체', label_en: 'All' },
  { id: 'major_required', label_ko: '전공 필수', label_en: 'Required Major' },
  { id: 'major_elective', label_ko: '전공 선택', label_en: 'Elective Major' },
  { id: 'general_elective', label_ko: '기타', label_en: 'Others' },
  { id: 'graduation_research', label_ko: '졸업 연구', label_en: 'Graduation Research' },
  { id: 'custom', label_ko: '사용자 추가', label_en: 'Custom' },
];

export type CourseListEntryStatus = 'completed' | 'planned' | 'not_taken';

// CourseListItem 이 받는 join 결과 shape — code + name_en + credit + 카테고리 + 사용자 상태.
// category 는 칩 필터링용 (활성 chip 과 매칭).
// semester / rawGrade 는 PATCH 호출에 사용.
// isCustom 은 사용자가 직접 추가한 custom 과목 여부 (delete UI 노출 분기용).
export type CourseListEntry = {
  code: string;
  name_ko: string;
  name_en: string;
  credit: number;
  category?: CategoryId;
  status: CourseListEntryStatus;
  grade?: Grade;
  gpaPoint?: number;
  plannedAddition?: number;
  semester: string;
  rawGrade: string;
  isCustom: boolean;
};

// Figure 3 Custom Credit Details (custom 과목용 보조 카드)
export type CustomCreditEntry = {
  code?: string;
  name_en: string;
  earned: number;
  required: number;
};

export const CUSTOM_CREDIT_ENTRIES: CustomCreditEntry[] = [];
