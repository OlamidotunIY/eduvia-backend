export interface AssessmentLearnerDto {
  id: string;
  fullName: string;
  email: string;
  image: string | null;
}

export interface AssessmentLessonDto {
  id: string;
  scheduledAt: Date;
  status: string;
  classroomId: string;
  classroomName: string | null;
  subjectId: string | null;
}

export interface AssessmentQuestionDto {
  id: string;
  stem: string;
  type: string;
  options: Array<{ key: string; text: string; imageUrl: string | null }>;
  markScheme: string | null;
}

export interface AssessmentResponseDto {
  id: string;
  responseType: string;
  textContent: string | null;
  imageUrl: string | null;
  selectedOption: string | null;
  submittedAt: Date;
}

export interface MarkingItemDetailDto {
  id: string;
  assessmentId: string;
  boardQuestionId: string;
  studentResponseId: string;
  questionType: string;
  maxMarks: number;
  autoMarked: boolean;
  marksAwarded: number | null;
  feedback: string | null;
  markedBy: string | null;
  markedAt: Date | null;
  status: string;
  question: AssessmentQuestionDto | null;
  response: AssessmentResponseDto | null;
}

export interface AssessmentDetailDto {
  id: string;
  orgId: string;
  lessonId: string;
  boardId: string;
  studentId: string;
  status: string;
  totalMaxMarks: number;
  totalMarksAwarded: number | null;
  scorePercent: number | null;
  autoMarkedCount: number;
  teacherMarkedCount: number;
  pendingMarkCount: number;
  learner: AssessmentLearnerDto | null;
  lesson: AssessmentLessonDto | null;
  markingItems: MarkingItemDetailDto[];
  createdAt: Date;
  updatedAt: Date;
}
