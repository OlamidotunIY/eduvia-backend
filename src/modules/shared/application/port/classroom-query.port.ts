export interface SharedClassroomDto {
  id: string;
  orgId: string;
  name: string;
  subjectId: string;
  primaryTeacherId: string;
  status: string;
  lessonDurationMins: number;
  maxStudents: number;
}

export interface SharedLessonDto {
  id: string;
  orgId: string;
  classroomId: string;
  teacherId: string;
  coverTeacherId: string | null;
  scheduledAt: Date;
  durationMins: number;
  status: string;
  meetingId: string | null;
  videoProvider: string | null;
  meetLink: string | null;
}

export abstract class IClassroomQueryPort {
  public abstract getClassroomById(id: string): Promise<SharedClassroomDto | null>;
  public abstract getLessonById(id: string): Promise<SharedLessonDto | null>;
  public abstract isStudentEnrolled(classroomId: string, studentId: string): Promise<boolean>;
  public abstract getStudentClassrooms(studentId: string): Promise<SharedClassroomDto[]>;
}
