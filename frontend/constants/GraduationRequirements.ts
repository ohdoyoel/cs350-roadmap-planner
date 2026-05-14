import type { AcademicTrack, CategoryId } from '@/lib/mocks/types';

export type CategoryRequirement = Partial<Record<CategoryId, number>>;

export type TrackRequirement = {
  track: AcademicTrack;
  label_ko: string;
  totalCredits: number;
  perCategory: CategoryRequirement;
  note_ko?: string;
};

// KAIST 전산학부 학부 로드맵 (학사과정용) PDF 우측 패널 기준
export const GRADUATION_REQUIREMENTS: Record<AcademicTrack, TrackRequirement> = {
  major: {
    track: 'major',
    label_ko: '주전공',
    totalCredits: 49,
    perCategory: {
      major_required: 19,
      major_elective: 30,
    },
  },
  minor: {
    track: 'minor',
    label_ko: '부전공',
    totalCredits: 21,
    perCategory: {
      major_required: 15,
      major_elective: 6,
    },
    note_ko: '타 학사조직 전공과목과의 중복 인정 불가',
  },
  double_major: {
    track: 'double_major',
    label_ko: '복수전공',
    totalCredits: 40,
    perCategory: {
      major_required: 19,
      major_elective: 21,
    },
    note_ko: '타 학사조직 전공과목의 최대 6학점까지 중복 인정 가능',
  },
};
