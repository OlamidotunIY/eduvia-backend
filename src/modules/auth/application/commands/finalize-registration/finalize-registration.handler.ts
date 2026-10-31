import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FinalizeRegistrationCommand } from './finalize-registration.command';
import { FinalizeRegistrationResult } from './finalize-registration.result';
import { IRegistrationRequestRepository } from '../../../domain/repository';
import {
  AuthAccount,
  AuthAccountId,
  IAuthAccountRepository,
  IOtpPort,
  ISessionRepository,
  ITokenPort,
  IVerificationRepository,
  RegistrationRequestId,
  Verification,
  VerificationId,
  VerificationType,
  Session,
  SessionId,
} from '../../../domain';
import { IUserQueryPort, RedisService } from '@modules/shared';

@CommandHandler(FinalizeRegistrationCommand)
export class FinalizeRegistrationHandler implements ICommandHandler<FinalizeRegistrationCommand, FinalizeRegistrationResult> {
  constructor(
    private readonly registrationRequestRepository: IRegistrationRequestRepository,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly verificationRepository: IVerificationRepository,
    private readonly otpPort: IOtpPort,
    private readonly redis: RedisService,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenPort: ITokenPort,
    private readonly userQueryPort: IUserQueryPort,
  ) {}

  async execute(command: FinalizeRegistrationCommand): Promise<FinalizeRegistrationResult> {
    const { payload } = command;

    const request = await this.registrationRequestRepository.findById(
      RegistrationRequestId.from(payload.registrationRequestId),
    );
    if (!request) throw new Error('Registration request not found');

    const existingAccount = await this.authAccountRepository.findByUserId(
      payload.userId,
    );
    if (existingAccount) {
      return { authAccountId: existingAccount.getId() };
    }

    const authAccount = request.providerId === 'credentials'
      ? AuthAccount.createCredentialsAccount({
          id: AuthAccountId.create(),
          userId: payload.userId,
          email: request.email,
          passwordHash: request.passwordHash ?? '',
          scope: 'onboarding',
        })
      : AuthAccount.createOAuthAccount({
          id: AuthAccountId.create(),
          accountId: request.providerAccountId ?? '',
          providerId: request.providerId,
          userId: payload.userId,
          scope: 'onboarding',
        });
    await this.authAccountRepository.save(authAccount);

    if (request.providerId === 'credentials') {
      const otp = await this.otpPort.generate();
      const ttlSeconds = 10 * 60;
      const rawValueRedisKey = `auth:verification:${payload.correlationId}:otp`;
      await this.redis.getClient().set(rawValueRedisKey, otp.code, 'EX', ttlSeconds);
      await this.verificationRepository.save(
        Verification.create({
          id: VerificationId.create(),
          identifier: request.email,
          valueHash: otp.hash,
          verificationType: VerificationType.EMAIL_VERIFICATION,
          expiresAt: new Date(Date.now() + ttlSeconds * 1000),
          maxAttempts: 5,
          rawValueRedisKey,
          correlationId: payload.correlationId,
        }),
      );
    }

    request.recordUserCreated(payload.userId);
    request.complete();
    await this.registrationRequestRepository.save(request);

    if (request.providerId === 'google') {
      const user = await this.userQueryPort.getUserById(payload.userId);
      if (!user) throw new Error('Registered user not found');

      const sessionId = SessionId.create();
      const refreshToken = await this.tokenPort.generateRefreshToken();
      await this.sessionRepository.save(
        Session.create({
          id: sessionId,
          userId: payload.userId,
          token: refreshToken.hash,
          expiresAt: refreshToken.expiresAt,
          ipAddress: undefined,
          userAgent: undefined,
        }),
      );
      const accessToken = await this.tokenPort.generateAccessToken({
        sub: authAccount.getId(),
        userId: payload.userId,
        userType: user.userType,
        scope: 'onboarding',
        sessionId: sessionId.value,
      });
      await this.redis.getClient().set(
        `auth:registration:google-session:${request.getId()}`,
        JSON.stringify({
          sessionId: sessionId.value,
          accessToken: accessToken.token,
          accessTokenExpiresAt: accessToken.expiresAt,
          refreshToken: refreshToken.raw,
          refreshTokenExpiresAt: refreshToken.expiresAt,
        }),
        'EX',
        10 * 60,
      );
    }

    return {
      authAccountId: authAccount.getId(),
    };
  }
}
