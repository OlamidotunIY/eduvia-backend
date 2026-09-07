import { Command } from "@nestjs/cqrs";
import { ActivateAuthAccountPayload } from "./activate-auth-account.result";

export class ActivateAuthAccountCommand extends Command<void>{
    constructor(
        public readonly payload: ActivateAuthAccountPayload
    ){
        super()
    }
}