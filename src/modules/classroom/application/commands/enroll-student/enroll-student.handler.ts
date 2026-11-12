import { randomUUID } from 'crypto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '@modules/shared';
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
    private readonly prisma: PrismaService,
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
        await this.syncStudentToClassroomChat(classroom.orgId, payload.classroomId, classroom.name, classroom.primaryTeacherId, payload.studentId);
        return { id: existing.id.value };
      }
      if (existing.status === EnrollmentStatus.PAUSED) {
        existing.resume();
        await this.enrollmentRepository.save(existing);
        await this.syncStudentToClassroomChat(classroom.orgId, payload.classroomId, classroom.name, classroom.primaryTeacherId, payload.studentId);
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

    // Sync enrolled student to the classroom's chatroom
    await this.syncStudentToClassroomChat(
      classroom.orgId,
      payload.classroomId,
      classroom.name,
      classroom.primaryTeacherId,
      payload.studentId,
    );

    return { id: enrollment.id.value };
  }

  private async syncStudentToClassroomChat(
    orgId: string,
    classroomId: string,
    classroomName: string,
    teacherId: string,
    studentId: string,
  ): Promise<void> {
    try {
      const conversation = await this.prisma.conversation.findFirst({
        where: { classroomId },
      });

      if (conversation) {
        const participants = Array.isArray(conversation.participants)
          ? [...(conversation.participants as string[])]
          : [];
        if (!participants.includes(studentId)) {
          participants.push(studentId);
          await this.prisma.conversation.update({
            where: { id: conversation.id },
            data: { participants },
          });
        }
      } else {
        // Auto-create chatroom if it didn't exist yet
        await this.prisma.conversation.create({
          data: {
            id: randomUUID(),
            orgId,
            type: 'classroom_group' as any,
            classroomId,
            subject: classroomName,
            participants: [teacherId, studentId],
            status: 'active',
          },
        });
      }
    } catch {
      // Non-blocking for student enrollment
    }
  }
}
