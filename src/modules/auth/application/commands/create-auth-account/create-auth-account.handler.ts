import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RedisService } from '@modules/shared';
import {
  AuthAccount,
  AuthAccountId,
  IAuthAccountRepository,
  IOtpPort,
  IVerificationRepository,
  Verification,
  VerificationId,
  VerificationType,
} from '../../../domain';
import { CreateAuthAccountCommand } from './create-auth-account.command';
import { CreateAuthAccountResult } from './create-auth-account.result';

@CommandHandler(CreateAuthAccountCommand)
export class CreateAuthAccountHandler implements ICommandHandler<
  CreateAuthAccountCommand,
  CreateAuthAccountResult
> {
  constructor(
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly verificationRepository: IVerificationRepository,
    private readonly otpPort: IOtpPort,
    private readonly redis: RedisService,
  ) {}

  async execute(
    command: CreateAuthAccountCommand,
  ): Promise<CreateAuthAccountResult> {
    const { payload } = command;

    const authAccountId = AuthAccountId.create();

    const existing = await this.authAccountRepository.findCredentialsByUserId(
      payload.userId,
    );
    if (existing) {
      return { id: existing.getId() };
    }

    const authAccount = AuthAccount.createCredentialsAccount({
      id: authAccountId,
      userId: payload.userId,
      email: payload.email,
      passwordHash: payload.passwordHash,
      scope: payload.scope,
    });

    await this.authAccountRepository.save(authAccount);

    const otp = await this.otpPort.generate();
    const rawValueRedisKey = `auth:verification:${payload.correlationId}:otp`;
    const ttlSeconds = 10 * 60;
    await this.redis.getClient().set(rawValueRedisKey, otp.code, 'EX', ttlSeconds);

    const verification = Verification.create({
      id: VerificationId.create(),
      identifier: payload.email.trim().toLowerCase(),
      valueHash: otp.hash,
      verificationType: VerificationType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      maxAttempts: 5,
      rawValueRedisKey,
      correlationId: payload.correlationId,
    });

    await this.verificationRepository.save(verification);

    return {
      id: authAccount.getId(),
    };
  }
}
