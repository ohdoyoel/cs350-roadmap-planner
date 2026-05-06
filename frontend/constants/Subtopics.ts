import type { SubtopicId } from '@/lib/mocks/types';

export type SubtopicToken = {
  id: SubtopicId;
  label_ko: string;
  label_en: string;
  // course card 우상단 dot 색 (KAIST 로드맵 PDF 범례 기반)
  dotColor: string;
  // subtopic 영역 배경 색 (KAIST 로드맵 PDF 영역 박스 기반)
  bgColor: string;
};

export const SUBTOPICS: Record<SubtopicId, SubtopicToken> = {
  data_science: {
    id: 'data_science',
    label_ko: '데이터 과학',
    label_en: 'Data Science',
    dotColor: '#ef4444',
    bgColor: '#fee2e2',
  },
  system_network: {
    id: 'system_network',
    label_ko: '시스템-네트워크',
    label_en: 'Systems & Network',
    dotColor: '#f97316',
    bgColor: '#ffedd5',
  },
  computational_theory: {
    id: 'computational_theory',
    label_ko: '전산이론',
    label_en: 'Computational Theory',
    dotColor: '#facc15',
    bgColor: '#fef9c3',
  },
  software_design: {
    id: 'software_design',
    label_ko: '소프트웨어디자인',
    label_en: 'Software Design',
    dotColor: '#4ade80',
    bgColor: '#dcfce7',
  },
  secure_computing: {
    id: 'secure_computing',
    label_ko: '시큐어컴퓨팅',
    label_en: 'Secure Computing',
    dotColor: '#111827',
    bgColor: '#d4d4d8',
  },
  visual_computing: {
    id: 'visual_computing',
    label_ko: '비주얼컴퓨팅',
    label_en: 'Visual Computing',
    dotColor: '#16a34a',
    bgColor: '#d1fae5',
  },
  ai_information_service: {
    id: 'ai_information_service',
    label_ko: '인공지능/정보서비스',
    label_en: 'AI / Information Service',
    dotColor: '#3b82f6',
    bgColor: '#dbeafe',
  },
  social_computing: {
    id: 'social_computing',
    label_ko: '소셜컴퓨팅',
    label_en: 'Social Computing',
    dotColor: '#1e40af',
    bgColor: '#cbd5e1',
  },
  interactive_computing: {
    id: 'interactive_computing',
    label_ko: '인터랙티브컴퓨팅',
    label_en: 'Interactive Computing',
    dotColor: '#a855f7',
    bgColor: '#e9d5ff',
  },
};

export const SUBTOPIC_ORDER: SubtopicId[] = [
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
