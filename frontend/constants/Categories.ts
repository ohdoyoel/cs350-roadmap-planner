import type { CategoryId } from '@/lib/mocks/types';

export type CategoryToken = {
  id: CategoryId;
  label_ko: string;
  label_en: string;
  // 카테고리 chip 배경 (SRS Figure 24 칩 톤 추정치, 사용자 검토 후 조정 가능)
  chipColor: string;
};

export const CATEGORIES: Record<CategoryId, CategoryToken> = {
  general_required: {
    id: 'general_required',
    label_ko: '기초필수',
    label_en: 'Basic Required',
    chipColor: '#dcfce7',
  },
  general_elective: {
    id: 'general_elective',
    label_ko: '기초선택',
    label_en: 'Basic Elective',
    chipColor: '#ecfccb',
  },
  major_required: {
    id: 'major_required',
    label_ko: '전공필수',
    label_en: 'Major Required',
    chipColor: '#fee2e2',
  },
  major_elective: {
    id: 'major_elective',
    label_ko: '전공선택',
    label_en: 'Major Elective',
    chipColor: '#fef3c7',
  },
  graduation_research: {
    id: 'graduation_research',
    label_ko: '졸업연구',
    label_en: 'Graduation Research',
    chipColor: '#fed7aa',
  },
  other: {
    id: 'other',
    label_ko: '기타',
    label_en: 'Other',
    chipColor: '#e5e7eb',
  },
};

export const CATEGORY_ORDER: CategoryId[] = [
  'general_required',
  'general_elective',
  'major_required',
  'major_elective',
  'graduation_research',
  'other',
];

const KO_TO_ID: Record<string, CategoryId> = Object.fromEntries(
  CATEGORY_ORDER.map((id) => [CATEGORIES[id].label_ko, id]),
);

export function categoryIdFromKo(label: string): CategoryId | undefined {
  return KO_TO_ID[label];
}
