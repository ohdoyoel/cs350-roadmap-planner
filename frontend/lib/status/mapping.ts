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

const REQUIREMENT_LABELS: Record<ApiRequirementKey, { id: RequirementGroupId; label: string }> = {
  basic: { id: 'other_requirements', label: 'Others' },
  major_required: { id: 'required_major', label: 'Required Major' },
  major_elective: { id: 'elective_major', label: 'Elective Major' },
  graduation_research: { id: 'graduation_research', label: 'Graduation Research' },
};

const REQUIREMENT_TO_CATEGORY: Record<ApiRequirementKey, CategoryId> = {
  basic: 'general_elective',
  major_required: 'major_required',
  major_elective: 'major_elective',
  graduation_research: 'graduation_research',
};

export function mapStatSummary(payload: ApiCreditGpa): StatSummary {
  const totalRequired = payload.requirements.reduce((sum, r) => sum + r.requiredCredits, 0);
  const plannedAddition = payload.requirements.reduce(
    (sum, r) => sum + r.remainingCredits,
    0,
  );
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
      label_en: meta.label,
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
    const category = group.items.length ? REQUIREMENT_TO_CATEGORY[group.key] : undefined;
    for (const item of group.items) {
      const status = statusFor(item.status);
      if (!status) continue;
      const gradeUi = gradeForUi(item.grade);
      const gpaPoint = gradeUi ? GRADE_POINTS[item.grade] : undefined;
      entries.push({
        code: item.courseCode,
        name_en: item.titleEn ?? item.title,
        credit: item.credit,
        category: item.type === 'custom' ? undefined : category,
        status,
        grade: status === 'completed' ? gradeUi : undefined,
        gpaPoint: status === 'completed' ? gpaPoint : undefined,
        plannedAddition: status === 'planned' ? item.credit : undefined,
        semester: item.semester,
        rawGrade: item.grade,
      });
    }
  }
  return entries;
}

export function buildSemesterOptions(currentSemester: string): SemesterOption[] {
  // 현재 학기를 첫 번째로 두고 8개 슬롯 전체를 보여준다.
  const ordered = [...SEMESTER_SLOTS].sort((a, b) => {
    if (a.id === currentSemester) return -1;
    if (b.id === currentSemester) return 1;
    return 0;
  });
  return ordered.map((slot) => ({ id: slot.id, label: slot.label }));
}
