import { apiGet } from './client';

export type ApiCredit = {
  lecture: number;
  lab: number;
  credit: number;
  au: number;
  raw: string;
};

export type ApiOfferedSemester = 'S' | 'F';

export type ApiCourse = {
  id: string;
  courseCode: string;
  courseName: string;
  courseNameEn: string | null;
  category: string;
  sectors: string[];
  offeredSemesters: ApiOfferedSemester[];
  credit: ApiCredit;
  prerequisites: string[];
  isKeyCourse: boolean;
  level: number | null;
  matched: boolean;
};

export type ApiCourseCategory = {
  category: string;
  nameEn: string;
  order: number;
  courseCount: number;
};

export type ApiCourseSector = {
  sector: string;
  nameEn: string;
  order: number;
  courseCount: number;
};

export type ListCoursesParams = {
  q?: string;
  category?: string;
  sector?: string;
  offeredSemester?: ApiOfferedSemester;
  isKeyCourse?: boolean;
  level?: number;
  includePrerequisites?: boolean;
};

export function listCourses(params?: ListCoursesParams) {
  return apiGet<ApiCourse[]>('/courses', params);
}

export function getCourse(courseCode: string) {
  return apiGet<ApiCourse>(`/courses/${courseCode}`);
}

export function listCourseCategories() {
  return apiGet<ApiCourseCategory[]>('/courses/categories');
}

export function listCourseSectors() {
  return apiGet<ApiCourseSector[]>('/courses/sectors');
}
