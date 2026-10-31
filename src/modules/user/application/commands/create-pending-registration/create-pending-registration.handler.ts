import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePendingRegistrationCommand } from './create-pending-registration.command';
import { CreatePendingRegistrationResult } from './create-pending-registration.result';
import { IUserRepository } from '../../../domain/repository';
import { User, UserId } from '../../../domain';

@CommandHandler(CreatePendingRegistrationCommand)
export class CreatePendingRegistrationHandler implements ICommandHandler<CreatePendingRegistrationCommand, CreatePendingRegistrationResult> {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreatePendingRegistrationCommand): Promise<CreatePendingRegistrationResult> {
    const { payload } = command;

    const existing = await this.userRepository.getUserByEmail(payload.email);
    if (existing) {
      return { id: existing.getId() };
    }

    const user = User.createPendingRegistration({
      id: UserId.create(),
      registrationRequestId: payload.registrationRequestId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      image: payload.imageUrl,
      emailVerified: payload.emailVerified,
      timezone: payload.timezone,
      correlationId: payload.correlationId,
    });
    await this.userRepository.save(user);

    return {
      id: user.getId(),
    };
  }
}
