import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand, GetUserByIdQuery } from '../../application';
import { RegisterUserDto } from '../dto';

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
}
