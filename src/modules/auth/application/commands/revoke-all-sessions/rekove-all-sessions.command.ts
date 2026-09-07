import { Command } from "@nestjs/cqrs";
import { RevokeAllSessionsPayload } from "./revoke-all-sessions.result";

export class RevokeAllSessionCommand extends Command<void>{
    constructor(
        public readonly payload: RevokeAllSessionsPayload
    ){
        super()
    }
}