import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { IUserRepository } from '../../../domain/repository/user.repository';
import { User } from '../../../domain/entities/user.entities';
import { CreateUserPayload, CreateUserResult } from './create-user.result';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  CreateUserResult
> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    const { payload } = command;

    const user = User.create({
      id: payload.id,
      userType: payload.userType,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      correlationId: payload.correlationId,
    });

    await this.userRepository.save(user);

    return {
      id: user.getId(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
    };
  }
}
