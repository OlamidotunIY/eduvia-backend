export interface StudentClassroomInfoDto {
  id: string;
  name: string;
  subjectId: string;
}

export type MasteryTier = 'Mastered' | 'Proficient' | 'In Progress' | 'Needs Support';

export interface StudentProgressMetricsDto {
  totalLessonsAttended: number;
  totalLessonsMissed: number;
  totalAssessments: number;
  averageScorePercent: number | null;
  masteredTopicsCount: number;
  inProgressTopicsCount: number;
  notStartedTopicsCount: number;
  overallMasteryLevel: number | null;
  masteryTier: MasteryTier;
  lastLessonAt: Date | null;
  lastUpdatedAt: Date | null;
}

export interface OrgStudentProgressItemDto {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  gradeLevel: string | null;
  classrooms: StudentClassroomInfoDto[];
  summary: StudentProgressMetricsDto;
}

export interface OrgStudentsProgressMetaDto {
  totalStudents: number;
  averageMasteryRate: number;
  totalLessonsAttended: number;
  studentsNeedingSupport: number;
  classrooms: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
}

export interface OrgStudentsProgressResponseDto {
  students: OrgStudentProgressItemDto[];
  meta: OrgStudentsProgressMetaDto;
}
