export interface SharedQuestionDto {
  id: string;
  stem: string;
  type: string;
  maxMarks: number;
  difficultyLevel: number;
  subject: string;
  curriculumNodeId: string | null;
  isPublished: boolean;
}

export interface SharedAssessmentDto {
  id: string;
  lessonId: string;
  studentId: string;
  orgId: string;
  status: string;
  totalMaxMarks: number;
  totalMarksAwarded: number | null;
  scorePercent: number | null;
}

export interface SharedMasteryDto {
  id: string;
  studentId: string;
  curriculumNodeId: string;
  orgId: string;
  masteryLevel: number;
  teacherAssessedScore: number | null;
  systemCalculatedScore: number | null;
  assessmentCount: number;
  lastUpdatedAt: Date;
}

export abstract class IAssessmentQueryPort {
  public abstract getQuestionById(id: string): Promise<SharedQuestionDto | null>;
  public abstract getAssessmentById(id: string): Promise<SharedAssessmentDto | null>;
  public abstract getAssessmentByLessonAndStudent(
    lessonId: string,
    studentId: string,
  ): Promise<SharedAssessmentDto | null>;
  public abstract getStudentMastery(
    studentId: string,
    curriculumNodeId: string,
    orgId: string,
  ): Promise<SharedMasteryDto | null>;
  public abstract getStudentMasteryList(
    studentId: string,
    orgId?: string,
  ): Promise<SharedMasteryDto[]>;
}
