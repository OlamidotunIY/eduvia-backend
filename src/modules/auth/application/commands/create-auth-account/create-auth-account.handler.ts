import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  AuthAccount,
  AuthAccountId,
  IAuthAccountRepository,
  IOtpPort,
  ITokenPort,
  IPasswordHashPort,
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
    private readonly tokenPort: ITokenPort,
    private readonly passwordHashPort: IPasswordHashPort,
    private readonly otpPort: IOtpPort,
  ) {}

  async execute(
    command: CreateAuthAccountCommand,
  ): Promise<CreateAuthAccountResult> {
    const { payload } = command;

    const authAccountId = AuthAccountId.create();

    const preAuthResult = await this.tokenPort.generatePreAuthToken({
      authAccountId: authAccountId.value,
    });

    const hashedPassword = await this.passwordHashPort.hash(
      payload.credentialHash,
    );

    const authAccount = AuthAccount.create({
      id: authAccountId,
      credentialHash: hashedPassword,
      scope: payload.scope,
      preAuthToken: preAuthResult.token,
      profileData: payload.profileData,
      correlationId: payload.correlationId,
    });

    await this.authAccountRepository.save(authAccount);

    const otp = await this.otpPort.generate();
    const verification = Verification.create({
      id: VerificationId.create(),
      authAccountId: authAccount.getId(),
      identifier: payload.profileData.email.trim().toLowerCase(),
      valueHash: otp.hash,
      verificationType: VerificationType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      maxAttempts: 5,
      correlationId: payload.correlationId,
    });

    await this.verificationRepository.save(verification);

    return {
      id: authAccount.getId(),
      preAuthToken: preAuthResult.token,
      preAuthTokenExpiresAt: preAuthResult.expiresAt,
    };
  }
}
