import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IPasswordHashPort, IUserQueryPort } from '@modules/shared';
import {
  IAuthAccountRepository,
  InvalidRefreshTokenError,
  ISessionRepository,
  ITokenPort,
} from '../../../domain';
import { RefreshSessionCommand } from './refresh-session.command';
import type { RefreshSessionResult } from './refresh-session.result';

@CommandHandler(RefreshSessionCommand)
export class RefreshSessionHandler implements ICommandHandler<
  RefreshSessionCommand,
  RefreshSessionResult
> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly userQueryPort: IUserQueryPort,
    private readonly passwordHashPort: IPasswordHashPort,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(command: RefreshSessionCommand): Promise<RefreshSessionResult> {
    const { payload } = command;
    const session = await this.sessionRepository.findById(payload.sessionId);

    if (!session || session.isExpired()) {
      if (session) await this.sessionRepository.delete(session.getId());
      throw new InvalidRefreshTokenError();
    }

    const valid = await this.passwordHashPort.compare(
      payload.refreshToken,
      session.token,
    );
    if (!valid) {
      // Treat reuse of an old rotated token as compromise of this session.
      await this.sessionRepository.delete(session.getId());
      throw new InvalidRefreshTokenError();
    }

    const [user, authAccount] = await Promise.all([
      this.userQueryPort.getUserById(session.userId),
      this.authAccountRepository.findByUserId(session.userId),
    ]);
    if (!user || !authAccount) {
      await this.sessionRepository.delete(session.getId());
      throw new InvalidRefreshTokenError();
    }

    const nextRefresh = await this.tokenPort.generateRefreshToken();
    session.rotate({
      tokenHash: nextRefresh.hash,
      expiresAt: nextRefresh.expiresAt,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    });
    await this.sessionRepository.save(session);

    const access = await this.tokenPort.generateAccessToken({
      sub: authAccount.getId(),
      userId: user.id,
      userType: user.userType,
      scope: authAccount.scope || 'user',
      sessionId: session.getId(),
    });

    return {
      sessionId: session.getId(),
      accessToken: access.token,
      accessTokenExpiresAt: access.expiresAt,
      refreshToken: nextRefresh.raw,
      refreshTokenExpiresAt: nextRefresh.expiresAt,
    };
  }
}
