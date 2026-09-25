import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteVerificationCommand } from './complete-verification.command';
import {
  IAuthAccountRepository,
  ISessionRepository,
  ITokenPort,
  IVerificationRepository,
  Session,
  SessionId,
  VerificationType,
} from '../../../domain';
import { IPasswordHashPort, IUserQueryPort } from '@modules/shared';
import crypto from 'node:crypto';
import { CompleteVerificationResult } from './complete-verification.result';

@CommandHandler(CompleteVerificationCommand)
export class CompleteVerificationHandler implements ICommandHandler<
  CompleteVerificationCommand,
  CompleteVerificationResult
> {
  constructor(
    private readonly verificationRepository: IVerificationRepository,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly passwordHashPort: IPasswordHashPort,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenPort: ITokenPort,
    private readonly userQueryPort: IUserQueryPort,
  ) {}

  async execute(
    command: CompleteVerificationCommand,
  ): Promise<CompleteVerificationResult> {
    const { payload } = command;

    const verification =
      await this.verificationRepository.findPendingVerification(
        payload.email,
        VerificationType.EMAIL_VERIFICATION,
      );

    if (!verification) {
      throw new Error('Verification not found');
    }

    await verification.verify(payload.code, (value, hash) =>
      this.passwordHashPort.compare(value, hash),
    );

    await this.verificationRepository.save(verification);

    const user = await this.userQueryPort.getUserByEmail(payload.email);
    if (!user) {
      throw new Error('User not found');
    }

    const authAccount =
      await this.authAccountRepository.findCredentialsByUserId(user.id);
    if (!authAccount) {
      throw new Error('Auth account not found');
    }

    authAccount.recordEmailVerified(payload.correlationId, payload.email);
    await this.authAccountRepository.save(authAccount);

    const refreshTokenResult = await this.tokenPort.generateRefreshToken();
    const sessionId = SessionId.create();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const session = Session.create({
      id: sessionId,
      expiresAt: refreshTokenResult.expiresAt,
      token: sessionToken,
      userId: user.id,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    });

    await this.sessionRepository.save(session);

    const accessTokenResult = await this.tokenPort.generateAccessToken({
      sub: authAccount.getId(),
      userId: user.id,
      userType: user.userType,
      scope: authAccount.scope || 'user',
      sessionId: session.getId(),
    });

    return {
      sessionId: session.getId(),
      accessToken: accessTokenResult.token,
      accessTokenExpiresAt: accessTokenResult.expiresAt,
      refreshToken: refreshTokenResult.raw,
      refreshTokenExpiresAt: refreshTokenResult.expiresAt,
    };
  }
}
