import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartEmailRegistrationCommand } from './start-email-registration.command';
import { StartEmailRegistrationResult } from './start-email-registration.result';
import { IRegistrationRequestRepository } from '../../../domain/repository';
import { IPasswordHashPort, IUserQueryPort } from '@modules/shared';
import { RegistrationRequest, RegistrationRequestId } from '../../../domain';

@CommandHandler(StartEmailRegistrationCommand)
export class StartEmailRegistrationHandler implements ICommandHandler<StartEmailRegistrationCommand, StartEmailRegistrationResult> {
  constructor(
    private readonly registrationRequestRepository: IRegistrationRequestRepository,
    private readonly passwordHashPort: IPasswordHashPort,
    private readonly userQueryPort: IUserQueryPort,
  ) {}

  async execute(command: StartEmailRegistrationCommand): Promise<StartEmailRegistrationResult> {
    const { payload } = command;

    const existingUser = await this.userQueryPort.getUserByEmail(payload.email);
    if (existingUser) {
      throw new Error('An account already exists for this email address');
    }

    const existingRequest = await this.registrationRequestRepository.findByEmail(
      payload.email.trim().toLowerCase(),
    );
    if (existingRequest) {
      return { registrationRequestId: existingRequest.getId() };
    }

    const request = RegistrationRequest.create({
      id: RegistrationRequestId.create(),
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      imageUrl: null,
      emailVerified: false,
      timezone: payload.timezone ?? 'UTC',
      providerId: 'credentials',
      providerAccountId: null,
      passwordHash: await this.passwordHashPort.hash(payload.passwordRaw),
      correlationId: payload.correlationId,
    });
    await this.registrationRequestRepository.save(request);

    return {
      registrationRequestId: request.getId(),
    };
  }
}
