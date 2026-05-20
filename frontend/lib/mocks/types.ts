// SRS Appendix B.2 (Class Diagram) 기준 도메인 타입.
// backend가 마일스톤 1에서 도메인 모델을 채우면 그 시점에 reconcile.

export type CategoryId =
  | 'general_required'
  | 'general_elective'
  | 'major_required'
  | 'major_elective'
  | 'graduation_research'
  | 'other';

export type SubtopicId =
  | 'data_science'
  | 'system_network'
  | 'computational_theory'
  | 'software_design'
  | 'secure_computing'
  | 'visual_computing'
  | 'ai_information_service'
  | 'social_computing'
  | 'interactive_computing';

export type SemesterTerm = 'spring' | 'fall' | 'summer';
export type CourseOfferedSemester = 'S' | 'F' | 'S/F';

export type Course = {
  id: string;
  code: string;
  name_ko: string;
  name_en?: string;
  credit: number;
  hoursLecture: number;
  hoursLab: number;
  level: 100 | 200 | 300 | 400;
  category: CategoryId;
  subtopics: SubtopicId[];
  offered: CourseOfferedSemester;
  description?: string;
  prerequisiteIds: string[];
};

export type CustomCourse = {
  id: string;
  name: string;
  credit: number;
  category: CategoryId | 'custom';
};

export type UserCourseStatus = 'not_taken' | 'planned' | 'completed';

export type Grade =
  | 'A+'
  | 'A0'
  | 'B+'
  | 'B0'
  | 'C+'
  | 'C0'
  | 'D+'
  | 'D0'
  | 'F'
  | 'P'
  | 'NP';

export type UserCourseState = {
  courseId: string;
  status: UserCourseStatus;
  grade?: Grade;
  semesterId?: string;
};

export type SemesterPlan = {
  id: string;
  year: number;
  term: SemesterTerm;
  label?: string;
};

export type Roadmap = {
  id: string;
  semesterIds: string[];
  currentSemesterId?: string;
};

export type RequirementProgress = {
  category: CategoryId;
  required: number;
  earned: number;
  planned: number;
};

export type AcademicTrack = 'major' | 'minor' | 'double_major';

export type Settings = {
  sound: boolean;
  vibration: boolean;
  academicTrack: AcademicTrack;
};
