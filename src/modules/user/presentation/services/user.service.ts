import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../../application';
import { UpdateUserCommand } from '../../application/commands/update-user';
import { CompleteUserOnboardingDto, RegisterStudentDto, UpdateUserDto } from '../dto';
import { UserId } from '../../domain';
import { RegisterStudentCommand } from '../../application/commands/register-student';
import { CompleteUserOnboardingCommand } from '../../application/commands/complete-user-onboarding';

@Injectable()
export class UserService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async getMe(userId: string) {
    return this.queryBus.execute(new GetUserByIdQuery({ userId }));
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new UpdateUserCommand({
        userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        correlationId,
      }),
    );
  }

  async completeOnboarding(userId: string, dto: CompleteUserOnboardingDto, correlationId: string) {
    return this.commandBus.execute(new CompleteUserOnboardingCommand({
      userId, userType: dto.userType, firstName: dto.firstName, lastName: dto.lastName,
      timezone: dto.timezone, correlationId,
    }));
  }

  async registerStudent(parentUserId: string, dto: RegisterStudentDto) {
    return this.commandBus.execute(
      new RegisterStudentCommand({
        userId: UserId.from(parentUserId),
        dateOfBirth: new Date(dto.dateOfBirth),
        countryCode: dto.countryCode,
        timezone: dto.timezone,
        gradeLevel: dto.gradeLevel,
      }),
    );
  }
}
