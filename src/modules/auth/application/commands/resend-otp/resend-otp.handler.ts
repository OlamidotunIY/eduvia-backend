import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResendOtpCommand } from './resend-otp.command';
import {
  IAuthAccountRepository,
  IOtpPort,
  IVerificationRepository,
  Verification,
  VerificationId,
  VerificationType,
} from '../../../domain';
import { IUserQueryPort, RedisService } from '@modules/shared';

@CommandHandler(ResendOtpCommand)
export class ResendOtpHandler implements ICommandHandler<ResendOtpCommand> {
  constructor(
    private readonly userQueryPort: IUserQueryPort,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly verificationRepository: IVerificationRepository,
    private readonly otpPort: IOtpPort,
    private readonly redis: RedisService,
  ) {}

  async execute(command: ResendOtpCommand): Promise<void> {
    const { payload } = command;

    const user = await this.userQueryPort.getUserByEmail(payload.email);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    const authAccount =
      await this.authAccountRepository.findCredentialsByUserId(user.id);
    if (!authAccount) {
      throw new Error('Auth account not found');
    }

    const { code, hash } = await this.otpPort.generate();
    const ttlSeconds = 10 * 60;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const rawValueRedisKey = `auth:verification:${payload.correlationId}:otp`;
    await this.redis.getClient().set(rawValueRedisKey, code, 'EX', ttlSeconds);

    const verification = Verification.create({
      id: VerificationId.create(),
      identifier: payload.email,
      valueHash: hash,
      verificationType: VerificationType.EMAIL_VERIFICATION,
      expiresAt,
      maxAttempts: 5,
      rawValueRedisKey,
      correlationId: payload.correlationId,
    });

    await this.verificationRepository.save(verification);
  }
}
