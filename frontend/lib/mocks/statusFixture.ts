// SRS Figure 1·2·3 (Status / GPA Calculator) 화면 그대로의 mock data.
// 향후 backend Calculator API와 client-side 계산 로직이 들어오면 교체.

import type { CategoryId, Grade } from '@/lib/mocks/types';

export type SemesterOption = {
  id: string;
  label: string;
};

export const SEMESTER_OPTIONS: SemesterOption[] = [
  { id: 'spring-2026', label: 'Spring 2026' },
  { id: 'fall-2025', label: 'Fall 2025' },
  { id: 'spring-2025', label: 'Spring 2025' },
];

export const CURRENT_SEMESTER_ID = 'spring-2026';

export type StatSummary = {
  earnedCredits: number;
  totalRequiredCredits: number;
  plannedCredits: number;
  plannedAdditionalCredits: number;
  cumulativeGpa: number;
  remainingCredits: number;
};

export const STAT_SUMMARY: StatSummary = {
  earnedCredits: 47,
  totalRequiredCredits: 130,
  plannedCredits: 19,
  plannedAdditionalCredits: 15,
  cumulativeGpa: 3.82,
  remainingCredits: 83,
};

export type RequirementGroupId =
  | 'required_major'
  | 'elective_major'
  | 'other_requirements'
  | 'graduation_research';

export type RequirementGroup = {
  id: RequirementGroupId;
  label_en: string;
  earned: number;
  required: number;
  planned: number;
};

export const REQUIREMENT_GROUPS: RequirementGroup[] = [
  { id: 'required_major', label_en: 'Required Major', earned: 27, required: 62, planned: 0 },
  { id: 'elective_major', label_en: 'Elective Major', earned: 10, required: 30, planned: 6 },
  { id: 'other_requirements', label_en: 'Other requirements', earned: 10, required: 38, planned: 0 },
  { id: 'graduation_research', label_en: 'Graduation Research', earned: 0, required: 3, planned: 0 },
];

export type FilterChipId = 'all' | CategoryId | 'graduation_research' | 'custom';

export const FILTER_CHIPS: { id: FilterChipId; label_en: string }[] = [
  { id: 'all', label_en: 'All' },
  { id: 'major_required', label_en: 'Required Major' },
  { id: 'major_elective', label_en: 'Elective Major' },
  { id: 'general_elective', label_en: 'Others' },
  { id: 'graduation_research', label_en: 'Grad' },
  { id: 'custom', label_en: 'Custom' },
];

export type CourseListEntryStatus = 'completed' | 'planned' | 'not_taken';

export type CourseListEntry = {
  code: string;
  name_en: string;
  credit: number;
  status: CourseListEntryStatus;
  grade?: Grade;
  gpaPoint?: number;
  plannedAddition?: number;
};

// Figure 1 Detailed Course List
export const COURSE_LIST: CourseListEntry[] = [
  { code: 'CS206', name_en: 'Discrete Math', credit: 3, status: 'completed', grade: 'A+', gpaPoint: 4.3 },
  { code: 'CS220', name_en: 'Computer Architecture', credit: 3, status: 'completed', grade: 'A0', gpaPoint: 3.7 },
  { code: 'CS230', name_en: 'System Programming', credit: 3, status: 'completed', grade: 'A+', gpaPoint: 4.3 },
  { code: 'CS360', name_en: 'Artificial Intelligence', credit: 3, status: 'planned', plannedAddition: 3 },
  { code: 'CS454', name_en: 'Networks', credit: 3, status: 'not_taken' },
];

// Figure 3 Custom Credit Details
export type CustomCreditEntry = {
  code?: string;
  name_en: string;
  earned: number;
  required: number;
};

export const CUSTOM_CREDIT_ENTRIES: CustomCreditEntry[] = [
  { name_en: 'Internship', earned: 3, required: 3 },
];
