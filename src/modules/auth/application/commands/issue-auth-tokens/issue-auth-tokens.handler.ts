import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IssueAuthTokensCommand } from './issue-auth-tokens.command';
import { IssueAuthTokensResult } from './issue-auth-tokens.result';
import { ISessionRepository, ITokenPort, Session } from '../../../domain/';

@CommandHandler(IssueAuthTokensCommand)
export class IssueAuthTokensHandler
  implements ICommandHandler<IssueAuthTokensCommand, IssueAuthTokensResult>
{
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(command: IssueAuthTokensCommand): Promise<IssueAuthTokensResult> {
    const { payload } = command;

    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.tokenPort.generateAccessToken({
        sub: payload.authAccountId,
        userId: payload.userId,
        userType: payload.userType,
        scope: payload.scope,
      }),
      this.tokenPort.generateRefreshToken(),
    ]);

    const session = Session.create({
      id: payload.id,
      authAccountId: payload.authAccountId,
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
