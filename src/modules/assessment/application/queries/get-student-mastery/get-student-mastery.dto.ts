export interface MasteryHistoryDetailDto {
  id: string;
  masteryRecordId: string;
  masteryLevel: number;
  trigger: string;
  lessonId: string | null;
  recordedAt: Date;
}

export interface StudentMasteryDto {
  id: string;
  studentId: string;
  curriculumNodeId: string;
  orgId: string;
  masteryLevel: number;
  teacherAssessedScore: number | null;
  systemCalculatedScore: number | null;
  assessmentCount: number;
  lastUpdatedAt: Date;
  history: MasteryHistoryDetailDto[];
}
