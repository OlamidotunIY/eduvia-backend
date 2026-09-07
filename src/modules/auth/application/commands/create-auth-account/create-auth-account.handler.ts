import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IAuthAccountRepository } from "../../../domain/repository/auth-account.repository";
import { AuthAccount } from "../../../domain/model/AuthAccount";
import { CreateAuthAccountCommand } from "./create-auth-account.command";

@CommandHandler(CreateAuthAccountCommand)
export class CreateAuthAccountHandler implements ICommandHandler<CreateAuthAccountCommand>{
    constructor(
        private readonly authAccountRepository:IAuthAccountRepository
    ){}

    async execute(command: CreateAuthAccountCommand):Promise<void>{
        const { payload } = command;

        const authAccount = AuthAccount.create({
            id: payload.id,
            userId: payload.userId,
            userType: payload.userType,
            credentialHash: payload.credentialHash,
            scope: payload.scope,
            correlationId: payload.correlationId
        });

        await this.authAccountRepository.save(authAccount)
    }
}