import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EnrollStudentCommand } from './enroll-student.command';
import {
  ClassroomFullError,
  ClassroomNotFoundError,
  ClassroomStatus,
  EnrollmentStatus,
  IClassroomRepository,
  IStudentEnrollmentRepository,
  StudentEnrollment,
} from '../../../domain';

@CommandHandler(EnrollStudentCommand)
export class EnrollStudentHandler
  implements ICommandHandler<EnrollStudentCommand, { id: string }>
{
  constructor(
    private readonly classroomRepository: IClassroomRepository,
    private readonly enrollmentRepository: IStudentEnrollmentRepository,
  ) {}

  async execute(command: EnrollStudentCommand): Promise<{ id: string }> {
    const { payload } = command;
    const classroom = await this.classroomRepository.findById(payload.classroomId);
    if (!classroom || classroom.orgId !== payload.orgId) {
      throw new ClassroomNotFoundError();
    }
    if (classroom.status !== ClassroomStatus.ACTIVE) {
      throw new ClassroomFullError('Cannot enroll in a non-active classroom');
    }

    const existing = await this.enrollmentRepository.findByClassroomAndStudent(
      payload.classroomId,
      payload.studentId,
    );
    if (existing) {
      if (existing.status === EnrollmentStatus.ACTIVE) {
        return { id: existing.id.value };
      }
      if (existing.status === EnrollmentStatus.PAUSED) {
        existing.resume();
        await this.enrollmentRepository.save(existing);
        return { id: existing.id.value };
      }
    }

    const activeCount = await this.enrollmentRepository.countActiveByClassroomId(
      payload.classroomId,
    );
    if (activeCount >= classroom.maxStudents) {
      throw new ClassroomFullError();
    }

    const enrollment = StudentEnrollment.create({
      classroomId: payload.classroomId,
      studentId: payload.studentId,
      orgId: payload.orgId,
      correlationId: payload.correlationId,
    });

    await this.enrollmentRepository.save(enrollment);

    return { id: enrollment.id.value };
  }
}
