// SRS Figure 9~14 (Semester Roadmap / Timetable) 화면 그대로의 mock data.
// 카드의 메타(이름·카테고리·학점·sector dot)는 GET /courses 결과로 join 한다.
// REQ-MAP-011 으로 Calculator (statusFixture) 와 동기화돼야 하나,
// 1차 PR 에서는 정적 레이아웃만이라 fixture 끼리는 아직 분리.

import type { CategoryId, SubtopicId } from '@/lib/mocks/types';

export type FilterMode = 'grade' | 'subject' | 'credits';

export const FILTER_MODES: { id: FilterMode; label_ko: string }[] = [
  { id: 'grade', label_ko: '학년별' },
  { id: 'subject', label_ko: '주제별' },
  { id: 'credits', label_ko: '수강학점' },
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

// Sticky top — 아직 어느 학기에도 배치 안 된 과목들.
export const UNPLACED_CARDS: TimetableCard[] = [
  { id: 'u-cs202', code: 'CS202', variant: 'small' },
  { id: 'u-cs322', code: 'CS322', variant: 'small' },
  { id: 'u-mas110', code: 'MAS110', variant: 'small' },
  { id: 'u-cs376', code: 'CS376', variant: 'small' },
];

export type SemesterStatus = 'past' | 'current' | 'future';

export type Semester = {
  id: string;
  label: string;
  status: SemesterStatus;
  bgColor: string;
  cards: TimetableCard[];
};

export const SEMESTERS: Semester[] = [
  {
    id: '1-spring',
    label: '1st Spring',
    status: 'past',
    bgColor: '#e0e7ff',
    cards: [
      { id: '1s-cs101', code: 'CS101', variant: 'big' },
    ],
  },
  {
    id: '1-fall',
    label: '1st Fall',
    status: 'past',
    bgColor: '#dbeafe',
    cards: [
      { id: '1f-mas109', code: 'MAS109', variant: 'big' },
      { id: '1f-cs206', code: 'CS206', variant: 'big' },
    ],
  },
  {
    id: '2-spring',
    label: '2nd Spring',
    status: 'past',
    bgColor: '#cffafe',
    cards: [
      { id: '2s-cs300', code: 'CS300', variant: 'big' },
      { id: '2s-cs361', code: 'CS361', variant: 'big' },
    ],
  },
  {
    id: '2-fall',
    label: '2nd Fall',
    status: 'current',
    bgColor: '#fce7f3',
    cards: [
      { id: '2f-cs360', code: 'CS360', variant: 'big' },
    ],
  },
  {
    id: '3-spring',
    label: '3rd Spring',
    status: 'future',
    bgColor: '#fef3c7',
    cards: [],
  },
  {
    id: '3-fall',
    label: '3rd Fall',
    status: 'future',
    bgColor: '#ffedd5',
    cards: [],
  },
  {
    id: '4-spring',
    label: '4th Spring',
    status: 'future',
    bgColor: '#d1fae5',
    cards: [
      { id: '4s-cs350', code: 'CS350', variant: 'big' },
    ],
  },
  {
    id: '4-fall',
    label: '4th Fall',
    status: 'future',
    bgColor: '#fbcfe8',
    cards: [],
  },
];
