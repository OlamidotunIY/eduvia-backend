import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterStudentCommand } from './register-student.command';
import { IParentProfileRepository, IStudentProfileRepository } from '../../../domain';
import { RegisterStudentResult } from './register-student.result';
import { StudentProfile } from '../../../domain/entities/student-profile-entities';
import { StudentProfileId } from '../../../domain/value-objects/student-profile-id.v0';

@CommandHandler(RegisterStudentCommand)
export class RegisterStudentHandler implements ICommandHandler<
  RegisterStudentCommand,
  RegisterStudentResult
> {
  constructor(
    private readonly parentProfileRepository: IParentProfileRepository,
    private readonly studentProfileRepository: IStudentProfileRepository,
  ) {}

  async execute(
    command: RegisterStudentCommand,
  ): Promise<RegisterStudentResult> {
    const { payload } = command;

    const parent = await this.parentProfileRepository.findByUserId(
      payload.userId,
    );

    if (!parent) {
      throw new Error('Parent profile not found');
    }

    const student = StudentProfile.create({
      id: StudentProfileId.create(),
      parentId: parent.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      dateOfBirth: payload.dateOfBirth,
      countryCode: payload.countryCode,
      timezone: payload.timezone,
      gradeLevel: payload.gradeLevel,
      avatarUrl: payload.avatarUrl,
    });

    await this.studentProfileRepository.save(student);

    return {
      id: student.id.value,
    };
  }
}
