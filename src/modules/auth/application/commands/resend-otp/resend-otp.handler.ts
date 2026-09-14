import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResendOtpCommand } from './resend-otp.command';
import { IAuthAccountRepository } from '../../../domain/repository/auth-account.repository';
import { IVerificationRepository } from '../../../domain/repository/verification.repository';
import { IOtpPort } from '../../../domain/ports';
import { Verification } from '../../../domain/model/Verification';
import { VerificationType } from '../../../domain/value-objects/verification-type.v0';
import { AuthStatus } from '../../../domain/value-objects/auth-status.v0';

@CommandHandler(ResendOtpCommand)
export class ResendOtpHandler implements ICommandHandler<ResendOtpCommand> {
  constructor(
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly verificationRepository: IVerificationRepository,
    private readonly otpPort: IOtpPort,
  ) {}

  async execute(command: ResendOtpCommand): Promise<void> {
    const { payload } = command;

    const authAccount = await this.authAccountRepository.findById(
      payload.authAccountId,
    );

    if (!authAccount) {
      throw new Error('Auth account not found');
    }

    if (authAccount.authStatus !== AuthStatus.PENDING_EMAIL_VERIFICATION) {
      throw new Error('Account is not pending email verification');
    }

    const { hash } = await this.otpPort.generate();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Creating a new Verification fires AuthVerificationCreatedEvent,
    // which the notification module listens to and sends the OTP email
    const verification = Verification.create({
      id: 0,
      authAccountId: payload.authAccountId,
      identifier: String(payload.authAccountId),
      valueHash: hash,
      verificationType: VerificationType.EMAIL_VERIFICATION,
      expiresAt,
      maxAttempts: 5,
      correlationId: payload.correlationId,
    });

    await this.verificationRepository.save(verification);
  }
}
