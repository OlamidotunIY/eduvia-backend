import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { IAuthAccountRepository } from '../../../domain/repository/auth-account.repository';
import { IVerificationRepository } from '../../../domain/repository/verification.repository';
import { CompleteVerificationCommand } from './complete-verification.command';

export interface IHashService {
  compare(value: string, hash: string): Promise<boolean>;
}

@CommandHandler(CompleteVerificationCommand)
export class CompleteVerificationHandler implements ICommandHandler<CompleteVerificationCommand> {
  constructor(
    private readonly verificationRepository: IVerificationRepository,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly hashService: IHashService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CompleteVerificationCommand): Promise<void> {
    const { payload } = command;

    const verification = await this.verificationRepository.findById(
      payload.verificationId,
    );

    if (!verification) {
      throw new Error('Verification not found');
    }

    await verification.verify(payload.value, (value, hash) =>
      this.hashService.compare(value, hash),
    );

    await this.verificationRepository.save(verification);

    const authAccount = await this.authAccountRepository.findById(
      verification.authAccountId,
    );

    if (!authAccount) {
      throw new Error('Auth account not found');
    }

    authAccount.activate();

    await this.authAccountRepository.save(authAccount);

    const events = verification.pullDomainEvents();
    for (const event of events) {
      this.eventBus.publish(event);
    }
  }
}
