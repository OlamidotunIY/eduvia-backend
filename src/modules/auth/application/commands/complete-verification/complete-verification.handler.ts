import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteVerificationCommand } from './complete-verification.command';
import { IAuthAccountRepository, IPasswordHashPort, IVerificationRepository } from '../../../domain';

@CommandHandler(CompleteVerificationCommand)
export class CompleteVerificationHandler
  implements ICommandHandler<CompleteVerificationCommand>
{
  constructor(
    private readonly verificationRepository: IVerificationRepository,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly passwordHashPort: IPasswordHashPort,
  ) {}

  async execute(command: CompleteVerificationCommand): Promise<void> {
    const { payload } = command;

    const verification = await this.verificationRepository.findById(
      payload.verificationId,
    );

    if (!verification) {
      throw new Error('Verification not found');
    }

    await verification.verify(
      payload.value,
      (value, hash) => this.passwordHashPort.compare(value, hash),
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
  }
}
