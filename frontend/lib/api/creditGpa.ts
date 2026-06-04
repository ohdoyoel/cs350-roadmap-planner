import { apiGet } from './client';
import type { ApiRoadmapGrade } from './roadmap';

export type ApiRequirementKey =
  | 'basic'
  | 'major_required'
  | 'major_elective'
  | 'major_total'
  | 'capstone'
  | 'graduation_research';

export type ApiCreditGpaStatus =
  | 'completed'
  | 'in_progress'
  | 'planned'
  | 'missing_grade'
  | 'excluded';

export type ApiCreditGpaCredits = {
  completed: number;
  inProgress: number;
  remaining: number;
};

export type ApiCreditGpaRequirement = {
  key: ApiRequirementKey;
  label: string;
  requiredCredits: number;
  completedCredits: number;
  inProgressCredits: number;
  remainingCredits: number;
};

export type ApiCreditGpaCourse = {
  type: 'catalog' | 'custom';
  courseCode: string;
  title: string;
  titleEn: string | null;
  semester: string;
  category: string;
  credit: number;
  grade: ApiRoadmapGrade;
  status: ApiCreditGpaStatus;
};

export type ApiCreditGpaGroup = {
  key: ApiRequirementKey;
  label: string;
  items: ApiCreditGpaCourse[];
};

export type ApiCreditGpa = {
  currentSemester: string;
  credits: ApiCreditGpaCredits;
  gpa: number | null;
  requirements: ApiCreditGpaRequirement[];
  courses: ApiCreditGpaGroup[];
};

export function getMyCreditGpa() {
  return apiGet<ApiCreditGpa>('/credit-gpa/me');
}
