import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { IssueAuthTokensResult } from '../issue-auth-tokens/issue-auth-tokens.result';
import {
  AccountPendingVerificationError,
  IAuthAccountRepository,
  InvalidCredentialsError,
  IOtpPort,
  IPasswordHashPort,
  ISessionRepository,
  ITokenPort,
  IVerificationRepository,
  Session,
  SessionId,
  Verification,
  VerificationId,
  VerificationType,
} from '../../../domain';
import { UserFacade } from '@modules/user';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  IssueAuthTokensResult
> {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly passwordHashPort: IPasswordHashPort,
    private readonly otpPort: IOtpPort,
    private readonly verificationRepository: IVerificationRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(command: LoginCommand): Promise<IssueAuthTokensResult> {
    const { payload } = command;

    const user = await this.userFacade.getUserIdByEmail(payload.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const authAccount = await this.authAccountRepository.findByUserId(user.id);
    if (!authAccount) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHashPort.compare(
      payload.passwordRaw,
      authAccount.credentialHash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    if (!authAccount.canAuthenticate()) {
      const { hash } = await this.otpPort.generate();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const verification = Verification.create({
        id: VerificationId.create(),
        authAccountId: authAccount.getId(),
        identifier: user.email,
        valueHash: hash,
        verificationType: VerificationType.EMAIL_VERIFICATION,
        expiresAt,
        maxAttempts: 5,
        correlationId: payload.correlationId,
      });

      await this.verificationRepository.save(verification);

      throw new AccountPendingVerificationError();
    }

    // 6. Generate Tokens
    // Need userType from user lookup
    const userType = user.userType as any; // Cast safely or parse

    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.tokenPort.generateAccessToken({
        sub: authAccount.getId(),
        userId: user.id,
        userType: userType,
        scope: authAccount.scope,
      }),
      this.tokenPort.generateRefreshToken(),
    ]);

    // 7. Create Session
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
