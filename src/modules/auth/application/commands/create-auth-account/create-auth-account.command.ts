import { Command } from "@nestjs/cqrs";
import { CreateAuthAccountPayload } from "./create-auth-account.result";

export class CreateAuthAccountCommand extends Command<void> {
    constructor(
        public readonly payload: CreateAuthAccountPayload
    ){
        super()
    }
}