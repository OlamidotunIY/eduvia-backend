import { Command } from "@nestjs/cqrs";
import { RevokeSessionPayload } from "./revoke-session.result";

export class RevokeSessionCommand extends Command<void>{
    constructor(
        public readonly payload: RevokeSessionPayload
    ){
        super()
    }
}