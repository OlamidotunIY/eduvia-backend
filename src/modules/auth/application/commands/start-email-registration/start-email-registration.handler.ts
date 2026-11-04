import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartEmailRegistrationCommand } from './start-email-registration.command';
import { StartEmailRegistrationResult } from './start-email-registration.result';
import { IRegistrationRequestRepository } from '../../../domain/repository';
import { IPasswordHashPort, IUserQueryPort } from '@modules/shared';
import { RegistrationRequest, RegistrationRequestId } from '../../../domain';
import { RedisService } from '@modules/shared';
import { randomBytes } from 'node:crypto';

@CommandHandler(StartEmailRegistrationCommand)
export class StartEmailRegistrationHandler implements ICommandHandler<StartEmailRegistrationCommand, StartEmailRegistrationResult> {
  constructor(
    private readonly registrationRequestRepository: IRegistrationRequestRepository,
    private readonly passwordHashPort: IPasswordHashPort,
    private readonly userQueryPort: IUserQueryPort,
    private readonly redis: RedisService,
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
    const registrationContinuation = randomBytes(32).toString('base64url');
    if (existingRequest) {
      await this.saveContinuation(existingRequest.getId(), registrationContinuation);
      return {
        registrationRequestId: existingRequest.getId(),
        registrationContinuation,
      };
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
    await this.saveContinuation(request.getId(), registrationContinuation);

    return {
      registrationRequestId: request.getId(),
      registrationContinuation,
    };
  }

  private async saveContinuation(
    registrationRequestId: string,
    registrationContinuation: string,
  ): Promise<void> {
    await this.redis.getClient().set(
      `auth:registration:continuation:${registrationRequestId}`,
      registrationContinuation,
      'EX',
      30 * 60,
    );
  }
}
