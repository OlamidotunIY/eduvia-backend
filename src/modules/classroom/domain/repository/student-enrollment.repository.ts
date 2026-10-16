import { BaseRepository } from '@modules/shared';
import { StudentEnrollmentId } from '../value-objects/student-enrollment-id.vo';
import { StudentEnrollment } from '../model/StudentEnrollment';

export abstract class IStudentEnrollmentRepository extends BaseRepository<
  StudentEnrollment,
  StudentEnrollmentId
> {
  public abstract findByClassroomId(classroomId: string): Promise<StudentEnrollment[]>;
  public abstract findByStudentId(studentId: string): Promise<StudentEnrollment[]>;
  public abstract findByClassroomAndStudent(
    classroomId: string,
    studentId: string,
  ): Promise<StudentEnrollment | null>;
  public abstract countActiveByClassroomId(classroomId: string): Promise<number>;
}
