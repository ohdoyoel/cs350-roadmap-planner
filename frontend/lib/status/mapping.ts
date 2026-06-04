// /credit-gpa/me 응답을 status 화면이 쓰는 view-model 로 매핑한다.

import type {
  ApiCreditGpa,
  ApiCreditGpaCourse,
  ApiCreditGpaGroup,
  ApiRequirementKey,
} from '@/lib/api/creditGpa';
import type {
  CourseListEntry,
  CourseListEntryStatus,
  RequirementGroup,
  RequirementGroupId,
  SemesterOption,
  StatSummary,
} from '@/lib/mocks/statusFixture';
import { SEMESTER_SLOTS } from '@/lib/mocks/timetableFixture';
import type { CategoryId, Grade } from '@/lib/mocks/types';

// 4.3 만점 KAIST GPA scale.
const GRADE_POINTS: Record<string, number> = {
  'A+': 4.3, A0: 4.0, 'A-': 3.7,
  'B+': 3.3, B0: 3.0, 'B-': 2.7,
  'C+': 2.3, C0: 2.0, 'C-': 1.7,
  'D+': 1.3, D0: 1.0, 'D-': 0.7,
  F: 0.0,
};

const REQUIREMENT_LABELS: Record<
  ApiRequirementKey,
  { id: RequirementGroupId; label_ko: string; label_en: string }
> = {
  basic: { id: 'other_requirements', label_ko: '기타', label_en: 'Others' },
  major_required: { id: 'required_major', label_ko: '전공 필수', label_en: 'Required Major' },
  major_elective: { id: 'elective_major', label_ko: '전공 선택', label_en: 'Elective Major' },
  major_total: { id: 'major_total', label_ko: '전공 합계', label_en: 'Major Total' },
  capstone: { id: 'capstone', label_ko: '졸업 작품', label_en: 'Capstone' },
  graduation_research: {
    id: 'graduation_research',
    label_ko: '졸업 연구',
    label_en: 'Graduation Research',
  },
};

// major_total / capstone 그룹의 course items 은 다른 그룹과 중복되므로
// 상세 코스 리스트엔 표시하지 않는다 (skip).
const REQUIREMENT_TO_CATEGORY: Partial<Record<ApiRequirementKey, CategoryId>> = {
  basic: 'general_elective',
  major_required: 'major_required',
  major_elective: 'major_elective',
  graduation_research: 'graduation_research',
};

// major_total 은 major_required + major_elective 의 집계라 합계에서 중복 제외.
const AGGREGATE_REQUIREMENT_KEYS = new Set<string>(['major_total']);

export function mapStatSummary(payload: ApiCreditGpa): StatSummary {
  const primary = payload.requirements.filter((r) => !AGGREGATE_REQUIREMENT_KEYS.has(r.key));
  const totalRequired = primary.reduce((sum, r) => sum + r.requiredCredits, 0);
  const plannedAddition = primary.reduce((sum, r) => sum + r.remainingCredits, 0);
  return {
    earnedCredits: payload.credits.completed,
    totalRequiredCredits: totalRequired,
    plannedCredits: payload.credits.inProgress,
    plannedAdditionalCredits: plannedAddition,
    cumulativeGpa: payload.gpa ?? 0,
    remainingCredits: payload.credits.remaining,
  };
}

export function mapRequirementGroups(payload: ApiCreditGpa): RequirementGroup[] {
  return payload.requirements.map((r) => {
    const meta = REQUIREMENT_LABELS[r.key];
    return {
      id: meta.id,
      label_ko: meta.label_ko,
      label_en: meta.label_en,
      earned: r.completedCredits,
      required: r.requiredCredits,
      planned: r.inProgressCredits,
    };
  });
}

function statusFor(status: ApiCreditGpaCourse['status']): CourseListEntryStatus | null {
  switch (status) {
    case 'completed':
    case 'missing_grade':
      return 'completed';
    case 'in_progress':
    case 'planned':
      return 'planned';
    case 'excluded':
      return null;
    default:
      return 'not_taken';
  }
}

function gradeForUi(grade: string): Grade | undefined {
  return grade in GRADE_POINTS ? (grade as Grade) : undefined;
}

export function mapCourseEntries(payload: ApiCreditGpa): CourseListEntry[] {
  const entries: CourseListEntry[] = [];
  for (const group of payload.courses as ApiCreditGpaGroup[]) {
    // capstone / major_total 은 다른 그룹의 item 을 다시 모아두는 집계 그룹이라 skip.
    if (!(group.key in REQUIREMENT_TO_CATEGORY)) continue;
    const category = group.items.length ? REQUIREMENT_TO_CATEGORY[group.key] : undefined;
    for (const item of group.items) {
      const status = statusFor(item.status);
      if (!status) continue;
      const gradeUi = gradeForUi(item.grade);
      const gpaPoint = gradeUi ? GRADE_POINTS[item.grade] : undefined;
      entries.push({
        code: item.courseCode,
        name_ko: item.title,
        name_en: item.titleEn ?? item.title,
        credit: item.credit,
        category: item.type === 'custom' ? undefined : category,
        status,
        grade: status === 'completed' ? gradeUi : undefined,
        gpaPoint: status === 'completed' ? gpaPoint : undefined,
        plannedAddition: status === 'planned' ? item.credit : undefined,
        semester: item.semester,
        rawGrade: item.grade,
        isCustom: item.type === 'custom',
      });
    }
  }
  return entries;
}

