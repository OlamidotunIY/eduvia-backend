import { Command } from "@nestjs/cqrs";
import { CreateAuthAccountPayload, CreateAuthAccountResult } from "./create-auth-account.result";

export class CreateAuthAccountCommand extends Command<CreateAuthAccountResult> {
    constructor(
        public readonly payload: CreateAuthAccountPayload
    ){
        super()
    }
}