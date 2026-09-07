import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SuspendAuthAccountCommand } from "./suspend-auth-account.command";
import { IAuthAccountRepository } from "../../../domain/repository/auth-account.repository";

@CommandHandler(SuspendAuthAccountCommand)
export class SuspendAuthAccountHandler implements ICommandHandler<SuspendAuthAccountCommand>{
    constructor(
        private readonly authAccountRepository: IAuthAccountRepository,
    ) {}

    async execute(command: SuspendAuthAccountCommand): Promise<void> {
        const { payload } = command;

        const authAccount = await this.authAccountRepository.findById(payload.authAccountId);

        if (!authAccount) {
            throw new Error('Auth account not found');
        }

        authAccount.suspend(payload.correlationId);

        await this.authAccountRepository.save(authAccount);
    }
}