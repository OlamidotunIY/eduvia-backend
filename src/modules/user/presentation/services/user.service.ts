import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand, GetUserByIdQuery } from '../../application';
import { UpdateUserCommand } from '../../application/commands/update-user';
import { RegisterStudentDto, RegisterUserDto, UpdateUserDto } from '../dto';
import { UserId } from '../../domain';
import { RegisterStudentCommand } from '../../application/commands/register-student';

@Injectable()
export class UserService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async register(dto: RegisterUserDto, correlationId: string) {
    return this.commandBus.execute(
      new CreateUserCommand({
        email: dto.email,
        passwordRaw: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        userType: dto.userType,
        timezone: dto.timezone,
        correlationId,
      }),
    );
  }

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
