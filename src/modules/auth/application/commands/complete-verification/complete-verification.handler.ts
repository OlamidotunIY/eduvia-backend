import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteVerificationCommand } from './complete-verification.command';
import { IssueAuthTokensResult } from '../issue-auth-tokens/issue-auth-tokens.result';
import {
  IAuthAccountRepository,
  IPasswordHashPort,
  ISessionRepository,
  ITokenPort,
  IVerificationRepository,
  Session,
  SessionId,
} from '../../../domain';
import { UserFacade } from '@modules/user';

@CommandHandler(CompleteVerificationCommand)
export class CompleteVerificationHandler implements ICommandHandler<
  CompleteVerificationCommand,
  IssueAuthTokensResult
> {
  constructor(
    private readonly verificationRepository: IVerificationRepository,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly passwordHashPort: IPasswordHashPort,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenPort: ITokenPort,
    private readonly userFacade: UserFacade,
  ) {}

  async execute(
    command: CompleteVerificationCommand,
  ): Promise<IssueAuthTokensResult> {
    const { payload } = command;

    const verification =
      await this.verificationRepository.findPendingVerification(
        payload.authAccountId,
      );

    if (!verification) {
      throw new Error('Verification not found');
    }

    await verification.verify(payload.value, (value, hash) =>
      this.passwordHashPort.compare(value, hash),
    );

    await this.verificationRepository.save(verification);

    const authAccount = await this.authAccountRepository.findById(
      verification.authAccountId,
    );

    if (!authAccount) {
      throw new Error('Auth account not found');
    }

    authAccount.activate();
    await this.authAccountRepository.save(authAccount);

    if (!authAccount.userId) {
      throw new Error('Auth account is not linked to a user');
    }

    const user = await this.userFacade.getUserById(authAccount.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userType = user.userType as any;

    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.tokenPort.generateAccessToken({
        sub: authAccount.getId(),
        userId: user.id,
        userType: userType,
        scope: authAccount.scope,
      }),
      this.tokenPort.generateRefreshToken(),
    ]);

    const session = Session.create({
      id: SessionId.create(),
      authAccountId: authAccount.getId(),
      refreshTokenHash: refreshTokenResult.hash,
      accessTokenExpiresAt: accessTokenResult.expiresAt,
      refreshTokenExpiresAt: refreshTokenResult.expiresAt,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
      correlationId: payload.correlationId,
    });

    await this.sessionRepository.save(session);

    return {
      sessionId: session.getId(),
      accessToken: accessTokenResult.token,
      accessTokenExpiresAt: accessTokenResult.expiresAt,
      refreshToken: refreshTokenResult.raw,
      refreshTokenExpiresAt: refreshTokenResult.expiresAt,
    };
  }
}
