export interface ClassroomStudentDTO {
  id: string;
  classroomId: string;
  orgId: string;
  studentId: string;
  status: string;
  enrolledAt: Date;
  removedAt: Date | null;
  learner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string | null;
  } | null;
}
