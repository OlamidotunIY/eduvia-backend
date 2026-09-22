import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { IUserRepository } from '../../../domain/repository/user.repository';
import { User } from '../../../domain/entities/user.entities';
import { CreateUserResult } from './create-user.result';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { IPasswordHashPort } from '@modules/shared';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  CreateUserResult
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHashPort: IPasswordHashPort,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    const { payload } = command;
    const passwordHash = await this.passwordHashPort.hash(payload.passwordRaw);

    const user = User.create({
      id: UserId.create(),
      userType: payload.userType,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      passwordHash,
      timezone: payload.timezone,
      correlationId: payload.correlationId,
    });

    await this.userRepository.save(user);

    return {
      id: user.getId(),
    };
  }
}
