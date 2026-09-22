import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterStudentCommand } from './register-student.command';
import { IParentProfileRepository, IStudentProfileRepository, StudentProfile, StudentProfileId } from '../../../domain';
import { RegisterStudentResult } from './register-student.result';

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
      dateOfBirth: payload.dateOfBirth,
      countryCode: payload.countryCode,
      timezone: payload.timezone,
      gradeLevel: payload.gradeLevel,
    });

    await this.studentProfileRepository.save(student);

    return {
      id: student.id.value,
    };
  }
}
