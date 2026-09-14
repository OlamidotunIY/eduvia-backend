import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IAuthAccountRepository } from '../../../domain/repository/auth-account.repository';
import { ITokenPort } from '../../../domain/ports';
import { AuthAccount } from '../../../domain/model/AuthAccount';
import { CreateAuthAccountCommand } from './create-auth-account.command';
import { CreateAuthAccountResult } from './create-auth-account.result';

@CommandHandler(CreateAuthAccountCommand)
export class CreateAuthAccountHandler
  implements ICommandHandler<CreateAuthAccountCommand, CreateAuthAccountResult>
{
  constructor(
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(command: CreateAuthAccountCommand): Promise<CreateAuthAccountResult> {
    const { payload } = command;

    // Generate pre-auth token first so it can be embedded in the domain event
    // payload — the event will be routed to the frontend via WebSocket (outbox)
    const preAuthResult = await this.tokenPort.generatePreAuthToken({
      authAccountId: payload.id,
    });

    const authAccount = AuthAccount.create({
      id: payload.id,
      userId: payload.userId,
      userType: payload.userType,
      credentialHash: payload.credentialHash,
      scope: payload.scope,
      preAuthToken: preAuthResult.token,
      correlationId: payload.correlationId,
    });

    // Base repo pulls domain events and writes them to outbox atomically
    await this.authAccountRepository.save(authAccount);

    return {
      id: authAccount.getId(),
      preAuthToken: preAuthResult.token,
      preAuthTokenExpiresAt: preAuthResult.expiresAt,
    };
  }
}
