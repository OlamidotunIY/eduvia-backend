import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveStudentCommand } from './remove-student.command';
import {
  IStudentEnrollmentRepository,
  StudentEnrollmentNotFoundError,
} from '../../../domain';

@CommandHandler(RemoveStudentCommand)
export class RemoveStudentHandler
  implements ICommandHandler<RemoveStudentCommand, { success: boolean }>
{
  constructor(
    private readonly enrollmentRepository: IStudentEnrollmentRepository,
  ) {}

  async execute(command: RemoveStudentCommand): Promise<{ success: boolean }> {
    const { payload } = command;
    const enrollment = await this.enrollmentRepository.findByClassroomAndStudent(
      payload.classroomId,
      payload.studentId,
    );
    if (!enrollment || enrollment.orgId !== payload.orgId) {
      throw new StudentEnrollmentNotFoundError();
    }

    enrollment.remove(payload.correlationId);
    await this.enrollmentRepository.save(enrollment);

    return { success: true };
  }
}
