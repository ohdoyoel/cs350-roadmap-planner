import { apiPatch } from './client';
import type { ApiUserSettings } from './auth';

export type AcademicOption = 'major' | 'minor' | 'double_major';

export function updateAcademicOption(option: AcademicOption) {
  return apiPatch<ApiUserSettings>('/me/academic-option', { academicOption: option });
}
