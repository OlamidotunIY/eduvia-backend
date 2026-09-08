import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { IAuthAccountRepository } from '../../../domain/repository/auth-account.repository';
import { AuthAccount } from '../../../domain/model/AuthAccount';
import { CreateAuthAccountCommand } from './create-auth-account.command';
import { CreateAuthAccountResult } from './create-auth-account.result';

@CommandHandler(CreateAuthAccountCommand)
export class CreateAuthAccountHandler implements ICommandHandler<CreateAuthAccountCommand, CreateAuthAccountResult> {
  constructor(
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateAuthAccountCommand): Promise<CreateAuthAccountResult> {
    const { payload } = command;

    const authAccount = AuthAccount.create({
      id: payload.id,
      userId: payload.userId,
      userType: payload.userType,
      credentialHash: payload.credentialHash,
      scope: payload.scope,
      correlationId: payload.correlationId,
    });

    await this.authAccountRepository.save(authAccount);

    const events = authAccount.pullDomainEvents();
    for (const event of events) {
      this.eventBus.publish(event);
    }

    return {
  id: authAccount.getId(),
};
  }
}
