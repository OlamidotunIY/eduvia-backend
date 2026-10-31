import { BadRequestException, ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomBytes } from 'node:crypto';
import {
  IAuthAccountRepository,
  IGoogleOAuthPort,
  IRegistrationRequestRepository,
  ISessionRepository,
  ITokenPort,
  GoogleOAuthIntent,
  GoogleOAuthState,
  RegistrationRequest,
  RegistrationRequestId,
  Session,
  SessionId,
} from '../../../domain';
import { IUserQueryPort, RedisService } from '@modules/shared';
import { CompleteGoogleOAuthCommand } from './complete-google-oauth.command';
import type { AuthTokensResult } from '../login/login.result';
import type { CompleteGoogleOAuthResult } from './complete-google-oauth.result';

@CommandHandler(CompleteGoogleOAuthCommand)
export class CompleteGoogleOAuthHandler implements ICommandHandler<CompleteGoogleOAuthCommand, CompleteGoogleOAuthResult> {
  constructor(
    private readonly googleOAuth: IGoogleOAuthPort,
    private readonly redis: RedisService,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly registrationRequestRepository: IRegistrationRequestRepository,
    private readonly userQueryPort: IUserQueryPort,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(command: CompleteGoogleOAuthCommand): Promise<CompleteGoogleOAuthResult> {
    const { code, state, ipAddress, userAgent } = command.payload;
    if (!code || !state) throw new BadRequestException('Missing Google OAuth code or state');
    const rawState = await this.redis.getClient().getdel(`auth:google-oauth:state:${state}`);
    if (!rawState) throw new UnauthorizedException('Google OAuth state is invalid or expired');
    const storedState = GoogleOAuthState.deserialize(rawState);
    if (!storedState) throw new UnauthorizedException('Google OAuth state is invalid');

    const identity = await this.googleOAuth.exchangeAuthorizationCode({ code, codeVerifier: storedState.codeVerifier });
    const linkedAccount = await this.authAccountRepository.findByProviderAccount('google', identity.subject);
    const callback = new URL(storedState.returnPath, process.env['FRONTEND_APP_URL'] ?? 'https://app.eduvia.name.ng');

    if (!linkedAccount) {
      const existingUser = await this.userQueryPort.getUserByEmail(identity.email);
      if (existingUser) throw new ConflictException('An Eduvia account already uses this email. Sign in with its existing method and link Google from account settings.');
      if (storedState.intent !== GoogleOAuthIntent.SIGNUP) throw new BadRequestException('No Google-linked Eduvia account exists. Start Google sign-up first.');

      const request = RegistrationRequest.create({
        id: RegistrationRequestId.create(), email: identity.email, firstName: identity.firstName,
        lastName: identity.lastName, imageUrl: identity.pictureUrl, emailVerified: true,
        timezone: 'UTC', providerId: 'google', providerAccountId: identity.subject,
        passwordHash: null, correlationId: state,
      });
      await this.registrationRequestRepository.save(request);
      callback.searchParams.set('registrationRequestId', request.getId());
      callback.searchParams.set('registrationStatus', 'pending');
      return { redirectUrl: callback.toString() };
    }

    const user = await this.userQueryPort.getUserById(linkedAccount.userId);
    if (!user || user.status === 'suspended') throw new ForbiddenException('This Eduvia account is suspended');
    const tokens = await this.issueSession({ authAccountId: linkedAccount.getId(), userId: user.id, userType: user.userType, scope: linkedAccount.scope ?? 'user', ipAddress, userAgent });
    const exchangeCode = randomBytes(32).toString('base64url');
    await this.redis.getClient().set(`auth:google-oauth:exchange:${exchangeCode}`, JSON.stringify(tokens), 'EX', 60);
    callback.searchParams.set('oauthCode', exchangeCode);
    return { redirectUrl: callback.toString() };
  }

  private async issueSession(input: { authAccountId: string; userId: string; userType: string; scope: string; ipAddress: string; userAgent: string }): Promise<AuthTokensResult> {
    const sessionId = SessionId.create();
    const refreshToken = await this.tokenPort.generateRefreshToken();
    await this.sessionRepository.save(Session.create({ id: sessionId, userId: input.userId, token: refreshToken.hash, expiresAt: refreshToken.expiresAt, ipAddress: input.ipAddress, userAgent: input.userAgent }));
    const accessToken = await this.tokenPort.generateAccessToken({ sub: input.authAccountId, userId: input.userId, userType: input.userType, scope: input.scope, sessionId: sessionId.getId() });
    return { sessionId: sessionId.getId(), accessToken: accessToken.token, accessTokenExpiresAt: accessToken.expiresAt, refreshToken: refreshToken.raw, refreshTokenExpiresAt: refreshToken.expiresAt };
  }
}
