// SRS Figure 20 (Settings UI) 기준 mock data.
// 향후 backend /users/settings 가 들어오면 fixture → API 로 교체.

import type { AcademicTrack, Settings } from '@/lib/mocks/types';

export type AcademicTrackOption = {
  id: AcademicTrack;
  label_en: string;
  label_ko: string;
};

export const ACADEMIC_TRACK_OPTIONS: AcademicTrackOption[] = [
  { id: 'major', label_en: 'Major', label_ko: '주전공' },
  { id: 'double_major', label_en: 'Double Major', label_ko: '복수전공' },
  { id: 'minor', label_en: 'Minor', label_ko: '부전공' },
];

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  vibration: false,
  academicTrack: 'minor',
};
