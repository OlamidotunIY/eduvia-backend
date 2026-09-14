import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { ISessionRepository } from '../../../domain/repository/session.repository';
import { ITokenRevocationPort } from '../../../domain/ports';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenRevocationPort: ITokenRevocationPort,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { payload } = command;

    const session = await this.sessionRepository.findById(payload.sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    session.revoke();

    await this.sessionRepository.save(session);

    // Blocklist jti so the access token is immediately rejected
    const ttlSeconds = Math.max(
      0,
      Math.floor((session.accessTokenExpiresAt.getTime() - Date.now()) / 1000),
    );

    if (ttlSeconds > 0) {
      await this.tokenRevocationPort.revoke(payload.jti, ttlSeconds);
    }
  }
}
