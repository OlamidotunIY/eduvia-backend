import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUserQueryPort, RedisService } from '@modules/shared';
import {
  IAuthAccountRepository,
  IOtpPort,
  IVerificationRepository,
  Verification,
  VerificationId,
  VerificationType,
} from '../../../domain';
import { RequestPasswordResetCommand } from './request-password-reset.command';

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler
  implements ICommandHandler<RequestPasswordResetCommand>
{
  constructor(
    private readonly userQueryPort: IUserQueryPort,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly verificationRepository: IVerificationRepository,
    private readonly otpPort: IOtpPort,
    private readonly redis: RedisService,
  ) {}

  async execute(command: RequestPasswordResetCommand): Promise<void> {
    const { payload } = command;
    const user = await this.userQueryPort.getUserByEmail(payload.email);

    if (!user) {
      return;
    }

    const authAccount =
      await this.authAccountRepository.findCredentialsByUserId(user.id);
    if (!authAccount) {
      return;
    }

    const { code, hash } = await this.otpPort.generate();
    const ttlSeconds = 10 * 60;
    const rawValueRedisKey = `auth:password-reset:${payload.correlationId}:otp`;
    await this.redis.getClient().set(rawValueRedisKey, code, 'EX', ttlSeconds);

    const verification = Verification.create({
      id: VerificationId.create(),
      identifier: user.email,
      valueHash: hash,
      verificationType: VerificationType.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      maxAttempts: 5,
      rawValueRedisKey,
      correlationId: payload.correlationId,
    });

    await this.verificationRepository.save(verification);
  }
}
