import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateCredentialsCommand } from "./update-credential.command";
import { IAuthAccountRepository } from "../../../domain/repository/auth-account.repository";

@CommandHandler(UpdateCredentialsCommand)
export class UpdateCredentialsHandler
  implements ICommandHandler<UpdateCredentialsCommand>
{
  constructor(
    private readonly authAccountRepository: IAuthAccountRepository,
  ) {}

  async execute(command: UpdateCredentialsCommand): Promise<void> {
    const { payload } = command;

    const authAccount = await this.authAccountRepository.findById(
      payload.authAccountId,
    );

    if (!authAccount) {
      throw new Error('Auth account not found');
    }

    authAccount.updateCredentials(
      payload.credentialHash
    );

    await this.authAccountRepository.save(authAccount);

    const events = authAccount.pullDomainEvents();
  }
}