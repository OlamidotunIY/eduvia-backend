import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import {
  AccountPendingVerificationError,
  IAuthAccountRepository,
  InvalidCredentialsError,
  IOtpPort,
  ISessionRepository,
  ITokenPort,
  IVerificationRepository,
  Session,
  SessionId,
  Verification,
  VerificationId,
  VerificationType,
} from '../../../domain';
import { IPasswordHashPort, IUserQueryPort, RedisService } from '@modules/shared';
import crypto from 'node:crypto';
import { AuthTokensResult } from './login.result';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  AuthTokensResult
> {
  constructor(
    private readonly userQueryPort: IUserQueryPort,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly passwordHashPort: IPasswordHashPort,
    private readonly otpPort: IOtpPort,
    private readonly verificationRepository: IVerificationRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenPort: ITokenPort,
    private readonly redis: RedisService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthTokensResult> {
    const { payload } = command;

    const user = await this.userQueryPort.getUserByEmail(payload.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const authAccount =
      await this.authAccountRepository.findCredentialsByUserId(user.id);
    if (!authAccount) {
      throw new InvalidCredentialsError();
    }

    if (!authAccount.password) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHashPort.compare(
      payload.passwordRaw,
      authAccount.password,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    if (!user.emailVerified) {
      const { code, hash } = await this.otpPort.generate();
      const ttlSeconds = 10 * 60;
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      const rawValueRedisKey = `auth:verification:${payload.correlationId}:otp`;
      await this.redis
        .getClient()
        .set(rawValueRedisKey, code, 'EX', ttlSeconds);

      const verification = Verification.create({
        id: VerificationId.create(),
        identifier: user.email,
        valueHash: hash,
        verificationType: VerificationType.EMAIL_VERIFICATION,
        expiresAt,
        maxAttempts: 5,
        rawValueRedisKey,
        correlationId: payload.correlationId,
      });

      await this.verificationRepository.save(verification);

      throw new AccountPendingVerificationError();
    }

    const sessionId = SessionId.create();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenResult = await this.tokenPort.generateRefreshToken();
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
