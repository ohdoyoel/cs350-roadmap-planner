import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export type ApiRoadmapGrade =
  | 'PLANNED'
  | 'A+' | 'A0' | 'A-'
  | 'B+' | 'B0' | 'B-'
  | 'C+' | 'C0' | 'C-'
  | 'D+' | 'D0' | 'D-'
  | 'F' | 'S' | 'U' | 'R';

export type ApiRoadmapCourseCatalog = {
  type: 'catalog';
  semester: string;
  courseCode: string;
  grade: ApiRoadmapGrade;
};

export type ApiRoadmapCourseCustom = {
  type: 'custom';
  semester: string;
  courseCode: string;
  title: string;
  credit: number;
  category: string;
  grade: ApiRoadmapGrade;
};

export type ApiRoadmapCourse = ApiRoadmapCourseCatalog | ApiRoadmapCourseCustom;

export type ApiPrerequisiteWarning = {
  courseCode: string;
  requiredCourseCode: string;
};

export type ApiRoadmap = {
  id: string;
  userId: string;
  currentSemester: string;
  courses: ApiRoadmapCourse[];
  warnings: ApiPrerequisiteWarning[];
  createdAt: string;
  updatedAt: string;
};

export function getMyRoadmap() {
  return apiGet<ApiRoadmap>('/roadmap/me');
}

export function setCurrentSemester(semester: string) {
  return apiPatch<ApiRoadmap>('/roadmap/me/current-semester', undefined, { semester });
}

export function addRoadmapCourse(body: ApiRoadmapCourse) {
  return apiPost<ApiRoadmap>('/roadmap/me/courses', body);
}

export function moveRoadmapCourse(params: {
  courseCode: string;
  fromSemester: string;
  toSemester: string;
}) {
  return apiPost<ApiRoadmap>('/roadmap/me/courses/move', undefined, params);
}

export function setRoadmapCourseGrade(
  semester: string,
  courseCode: string,
  grade: ApiRoadmapGrade,
) {
  return apiPatch<ApiRoadmap>(
    `/roadmap/me/courses/${semester}/${courseCode}/grade`,
    undefined,
    { grade },
  );
}

export function deleteRoadmapCourse(semester: string, courseCode: string) {
  return apiDelete<ApiRoadmap>(`/roadmap/me/courses/${semester}/${courseCode}`);
}
