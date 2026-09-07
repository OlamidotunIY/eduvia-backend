import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ActivateAuthAccountCommand } from "./activate-auth-account.command";
import { IAuthAccountRepository } from "../../../domain/repository/auth-account.repository";

@CommandHandler(ActivateAuthAccountCommand)
export class ActivateAuthAccountHandler implements ICommandHandler<ActivateAuthAccountCommand>{
    constructor(
        private readonly authAccountRepository: IAuthAccountRepository
    ){}

    async execute(command: ActivateAuthAccountCommand): Promise<void> {
        const { payload } = command;

        const authAccount = await this.authAccountRepository.findById(payload.authAccountId);
        if(!authAccount){
            throw new Error('Auth account not found')
        };

        authAccount.activate()

        await this.authAccountRepository.save(authAccount)
    }
}