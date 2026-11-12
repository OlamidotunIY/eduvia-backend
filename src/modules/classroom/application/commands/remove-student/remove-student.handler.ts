import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@modules/shared';
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
    private readonly prisma: PrismaService,
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

    try {
      const conversation = await this.prisma.conversation.findFirst({
        where: { classroomId: payload.classroomId },
      });
      if (conversation) {
        const participants = Array.isArray(conversation.participants)
          ? (conversation.participants as string[]).filter(
              (id) => id !== payload.studentId,
            )
          : [];
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: { participants },
        });
      }
    } catch {
      // Non-blocking
    }

    return { success: true };
  }
}
