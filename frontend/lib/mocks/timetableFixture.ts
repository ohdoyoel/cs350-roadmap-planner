// SRS Figure 9~14 (Semester Roadmap / Timetable) 화면 의 정적 메타데이터.
// 카드의 메타(이름·카테고리·학점·sector dot)는 GET /courses 결과로 join 한다.
// 사용자가 배치한 과목은 GET /roadmap/me 에서 가져온다.

import type { CategoryId, SubtopicId } from '@/lib/mocks/types';

export type FilterMode = 'grade' | 'subject' | 'credits';

export const FILTER_MODES: { id: FilterMode; label_ko: string; label_en: string }[] = [
  { id: 'grade', label_ko: '학년별', label_en: 'By Year' },
  { id: 'subject', label_ko: '주제별', label_en: 'By Topic' },
  { id: 'credits', label_ko: '수강학점', label_en: 'By Credit' },
];

export const GRADE_CHIPS: CategoryId[] = [
  'general_required',
  'general_elective',
  'major_required',
  'major_elective',
];

export const SUBJECT_CHIPS: SubtopicId[] = [
  'data_science',
  'system_network',
  'computational_theory',
  'software_design',
  'secure_computing',
  'visual_computing',
  'ai_information_service',
  'social_computing',
  'interactive_computing',
];

export type CreditChip = {
  id: CategoryId;
  earned: number;
  planned: number;
  required: number;
};

export const CREDIT_CHIPS: CreditChip[] = [
  { id: 'general_required', earned: 3, planned: 0, required: 3 },
  { id: 'general_elective', earned: 6, planned: 0, required: 9 },
  { id: 'major_required', earned: 6, planned: 3, required: 19 },
  { id: 'major_elective', earned: 0, planned: 6, required: 30 },
];

export type TimetableCardVariant = 'small' | 'big';

// fixture-internal 키 + 백엔드 courseCode 만 들고있다. 나머지는 ApiCourse 에서 join.
export type TimetableCard = {
  id: string;
  code: string;
  variant?: TimetableCardVariant;
};

export type SemesterStatus = 'past' | 'current' | 'future';

export type Semester = {
  id: string;
  label_ko: string;
  label_en: string;
  status: SemesterStatus;
  bgColor: string;
  cards: TimetableCard[];
};

// 학기 슬롯 메타데이터. backend semester format ("<year>-<term>") 와 동일.
export type SemesterSlot = {
  id: string;
  label_ko: string;
  label_en: string;
  bgColor: string;
};

export const SEMESTER_SLOTS: SemesterSlot[] = [
  { id: '1-1', label_ko: '1학년 봄', label_en: '1st Spring', bgColor: '#e0e7ff' },
  { id: '1-2', label_ko: '1학년 가을', label_en: '1st Fall', bgColor: '#dbeafe' },
  { id: '2-1', label_ko: '2학년 봄', label_en: '2nd Spring', bgColor: '#cffafe' },
  { id: '2-2', label_ko: '2학년 가을', label_en: '2nd Fall', bgColor: '#fce7f3' },
  { id: '3-1', label_ko: '3학년 봄', label_en: '3rd Spring', bgColor: '#fef3c7' },
  { id: '3-2', label_ko: '3학년 가을', label_en: '3rd Fall', bgColor: '#ffedd5' },
  { id: '4-1', label_ko: '4학년 봄', label_en: '4th Spring', bgColor: '#d1fae5' },
  { id: '4-2', label_ko: '4학년 가을', label_en: '4th Fall', bgColor: '#fbcfe8' },
];

export function semesterToNumber(id: string): number {
  const [yr, term] = id.split('-').map(Number);
  if (!Number.isFinite(yr) || !Number.isFinite(term)) return 1;
  return (yr - 1) * 2 + term;
}

const EXTRA_BG_PALETTE = ['#ede9fe', '#fee2e2', '#e0f2fe', '#dcfce7', '#fef9c3', '#ffe4e6'];

function ordinalLabel(year: number): string {
  if (year === 1) return '1st';
  if (year === 2) return '2nd';
  if (year === 3) return '3rd';
  return `${year}th`;
}

// 8 슬롯(4년) 밖 학기. id 예: "5-1", "5-2", "6-1".
export function buildExtraSemesterSlot(id: string): SemesterSlot {
  const [yrStr, termStr] = id.split('-');
  const yr = Number(yrStr) || 5;
  const term = Number(termStr) || 1;
  const termEn = term === 1 ? 'Spring' : 'Fall';
  const termKo = term === 1 ? '봄' : '가을';
  const paletteIdx = ((yr - 5) * 2 + (term - 1)) % EXTRA_BG_PALETTE.length;
  return {
    id,
    label_ko: `${yr}학년 ${termKo}`,
    label_en: `${ordinalLabel(yr)} ${termEn}`,
    bgColor: EXTRA_BG_PALETTE[Math.max(0, paletteIdx)],
  };
}

// SEMESTER_SLOTS 의 마지막 다음 학기 id.
export function nextExtraSemesterId(existing: Iterable<string>): string {
  const used = new Set(existing);
  let yr = 5;
  let term = 1;
  while (used.has(`${yr}-${term}`)) {
    if (term === 1) {
      term = 2;
    } else {
      yr += 1;
      term = 1;
    }
  }
  return `${yr}-${term}`;
}

export function deriveSemesterStatus(id: string, currentId: string): SemesterStatus {
  const n = semesterToNumber(id);
  const c = semesterToNumber(currentId);
  if (n < c) return 'past';
  if (n === c) return 'current';
  return 'future';
}
