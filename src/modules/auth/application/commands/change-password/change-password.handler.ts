import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IPasswordHashPort, IUserQueryPort } from '@modules/shared';
import {
  IAuthAccountRepository,
  IVerificationRepository,
  VerificationType,
} from '../../../domain';
import { ChangePasswordCommand } from './change-password.command';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(
    private readonly userQueryPort: IUserQueryPort,
    private readonly authAccountRepository: IAuthAccountRepository,
    private readonly verificationRepository: IVerificationRepository,
    private readonly passwordHashPort: IPasswordHashPort,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const { payload } = command;
    const verification =
      await this.verificationRepository.findPendingVerification(
        payload.email,
        VerificationType.PASSWORD_RESET,
      );

    if (!verification) {
      throw new Error('Password reset verification not found');
    }

    await verification.verify(payload.code, (value, hash) =>
      this.passwordHashPort.compare(value, hash),
    );
    await this.verificationRepository.save(verification);

    const user = await this.userQueryPort.getUserByEmail(payload.email);
    if (!user) {
      throw new Error('User not found');
    }

    const authAccount =
      await this.authAccountRepository.findCredentialsByUserId(user.id);
    if (!authAccount) {
      throw new Error('Auth account not found');
    }

    authAccount.updatePassword(
      await this.passwordHashPort.hash(payload.newPassword),
    );
    await this.authAccountRepository.save(authAccount);
  }
}
