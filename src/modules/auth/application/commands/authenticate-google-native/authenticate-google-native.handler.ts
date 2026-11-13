import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomBytes } from 'node:crypto';
import { IUserQueryPort, RedisService } from '@modules/shared';
import {
  GoogleOAuthIntent,
  IAuthAccountRepository,
  IGoogleOAuthPort,
  IRegistrationRequestRepository,
  ISessionRepository,
  ITokenPort,
  RegistrationRequest,
  RegistrationRequestId,
  Session,
  SessionId,
} from '../../../domain';
import { AuthenticateGoogleNativeCommand } from './authenticate-google-native.command';
import type { AuthenticateGoogleNativeResult } from './authenticate-google-native.result';

@CommandHandler(AuthenticateGoogleNativeCommand)
export class AuthenticateGoogleNativeHandler implements ICommandHandler<
  AuthenticateGoogleNativeCommand,
  AuthenticateGoogleNativeResult
> {
  constructor(
    private readonly googleOAuth: IGoogleOAuthPort,
    private readonly redis: RedisService,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly registrationRequestRepository: IRegistrationRequestRepository,
    private readonly userQueryPort: IUserQueryPort,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(
    command: AuthenticateGoogleNativeCommand,
  ): Promise<AuthenticateGoogleNativeResult> {
    const { idToken, intent, ipAddress, userAgent, correlationId } =
      command.payload;
    const identity = await this.googleOAuth.verifyIdToken(idToken);
    const linkedAccount = await this.authAccountRepository.findByProviderAccount(
      'google',
      identity.subject,
    );

    if (!linkedAccount) {
      const existingUser = await this.userQueryPort.getUserByEmail(
        identity.email,
      );
      if (existingUser) {
        throw new ConflictException(
          'An Eduvia account already uses this email. Sign in with its existing method and link Google from account settings.',
        );
      }
      if (intent !== GoogleOAuthIntent.SIGNUP) {
        throw new BadRequestException(
          'No Google-linked Eduvia account exists. Start Google sign-up first.',
        );
      }

      const request = RegistrationRequest.create({
        id: RegistrationRequestId.create(),
        email: identity.email,
        firstName: identity.firstName,
        lastName: identity.lastName,
        imageUrl: identity.pictureUrl,
        emailVerified: true,
        timezone: 'UTC',
        providerId: 'google',
        providerAccountId: identity.subject,
        passwordHash: null,
        correlationId,
      });
      await this.registrationRequestRepository.save(request);

      const registrationContinuation = randomBytes(32).toString('base64url');
      await this.redis
        .getClient()
        .set(
          `auth:registration:continuation:${request.getId()}`,
          registrationContinuation,
          'EX',
          30 * 60,
        );

      return {
        registrationStatus: 'pending',
        registrationRequestId: request.getId(),
        registrationContinuation,
      };
    }

    const user = await this.userQueryPort.getUserById(linkedAccount.userId);
    if (!user || user.status === 'suspended') {
      throw new ForbiddenException('This Eduvia account is suspended');
    }

    const sessionId = SessionId.create();
    const refreshToken = await this.tokenPort.generateRefreshToken();
    await this.sessionRepository.save(
      Session.create({
        id: sessionId,
        userId: user.id,
        token: refreshToken.hash,
        expiresAt: refreshToken.expiresAt,
        ipAddress,
        userAgent,
      }),
    );
    const accessToken = await this.tokenPort.generateAccessToken({
      sub: linkedAccount.getId(),
      userId: user.id,
      userType: user.userType,
      scope: linkedAccount.scope ?? 'user',
      sessionId: sessionId.value,
    });

    return {
      sessionId: sessionId.value,
      accessToken: accessToken.token,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshToken: refreshToken.raw,
      refreshTokenExpiresAt: refreshToken.expiresAt,
    };
  }
}
