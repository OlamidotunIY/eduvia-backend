import { ConflictException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterStudentCommand } from './register-student.command';
import {
  IParentProfileRepository,
  IStudentProfileRepository,
  IUserRepository,
  OnboardingStatus,
  ParentProfile,
  ParentProfileId,
  StudentProfile,
  StudentProfileId,
  User,
  UserId,
  UserType,
} from '../../../domain';
import { RegisterStudentResult } from './register-student.result';
import { IPasswordHashPort, PrismaService } from '@modules/shared';

@Injectable()
@CommandHandler(RegisterStudentCommand)
export class RegisterStudentHandler
  implements ICommandHandler<RegisterStudentCommand, RegisterStudentResult>
{
  constructor(
    private readonly parentProfileRepository: IParentProfileRepository,
    private readonly studentProfileRepository: IStudentProfileRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordHashPort: IPasswordHashPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: RegisterStudentCommand): Promise<RegisterStudentResult> {
    const { payload } = command;

    let parent = await this.parentProfileRepository.findByUserId(
      payload.parentUserId,
    );

    if (!parent) {
      parent = ParentProfile.create({
        id: ParentProfileId.create(),
        userId: payload.parentUserId,
      });
      await this.parentProfileRepository.save(parent);
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const existingByEmail = await this.userRepository.getUserByEmail(normalizedEmail);
    if (existingByEmail) {
      throw new ConflictException('A user with this email or username is already registered');
    }

    if (payload.username) {
      const normalizedUsername = payload.username.trim().toLowerCase();
      const existingByUsername = await this.userRepository.getUserByEmail(normalizedUsername);
      if (existingByUsername) {
        throw new ConflictException('A user with this username is already registered');
      }
    }

    const studentUserId = UserId.create();
    const passwordHash = await this.passwordHashPort.hash(payload.passwordRaw);

    const studentUser = User.create({
      id: studentUserId,
      userType: UserType.STUDENT,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: normalizedEmail,
      username: payload.username || null,
      emailVerified: true,
      timezone: payload.timezone || 'UTC',
      onboardingStatus: OnboardingStatus.COMPLETED,
    });

    await this.userRepository.save(studentUser);

    const studentProfile = StudentProfile.create({
      id: StudentProfileId.from(studentUserId.value),
      parentId: parent.id,
      dateOfBirth: payload.dateOfBirth,
      countryCode: payload.countryCode || 'GB',
      timezone: payload.timezone || 'UTC',
      gradeLevel: payload.gradeLevel,
    });

    await this.studentProfileRepository.save(studentProfile);

    await this.prisma.account.create({
      data: {
        accountId: normalizedEmail,
        providerId: 'credentials',
        userId: studentUserId.value,
        password: passwordHash,
        scope: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      id: studentUserId.value,
      email: normalizedEmail,
      firstName: payload.firstName,
      lastName: payload.lastName,
      gradeLevel: payload.gradeLevel || null,
    };
  }
}
