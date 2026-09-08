import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { IUserRepository } from '../../../domain/repository/user.repository';
import { User } from '../../../domain/entities/user.entities';
import { CreateUserResult } from './create-user.result';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  CreateUserResult
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

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

    const events = user.pullDomainEvents();
    for (const event of events) {
      this.eventBus.publish(event);
    }

    return {
      id: user.getId(),
    };
  }
}
