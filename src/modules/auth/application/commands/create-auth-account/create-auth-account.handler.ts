import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  AuthAccount,
  IAuthAccountRepository,
  ITokenPort,
  IPasswordHashPort,
} from '../../../domain';
import { CreateAuthAccountCommand } from './create-auth-account.command';
import { CreateAuthAccountResult } from './create-auth-account.result';

@CommandHandler(CreateAuthAccountCommand)
export class CreateAuthAccountHandler implements ICommandHandler<
  CreateAuthAccountCommand,
  CreateAuthAccountResult
> {
  constructor(
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly tokenPort: ITokenPort,
    private readonly passwordHashPort: IPasswordHashPort,
  ) {}

  async execute(
    command: CreateAuthAccountCommand,
  ): Promise<CreateAuthAccountResult> {
    const { payload } = command;

    // Generate pre-auth token first so it can be embedded in the domain event
    // payload — the event will be routed to the frontend via WebSocket (outbox)
    // Generate pre-auth token first
    const preAuthResult = await this.tokenPort.generatePreAuthToken({
      authAccountId: payload.id,
    });

    const hashedPassword = await this.passwordHashPort.hash(
      payload.credentialHash,
    );

    const authAccount = AuthAccount.create({
      id: payload.id,
      credentialHash: hashedPassword,
      scope: payload.scope,
      preAuthToken: preAuthResult.token,
      profileData: payload.profileData,
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
