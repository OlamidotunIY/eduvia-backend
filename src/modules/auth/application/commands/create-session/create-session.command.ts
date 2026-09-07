import { Command } from "@nestjs/cqrs";
import { CreateSessionPayload } from "./create-session.result";

export class CreateSessionCommand extends Command<void>{
    constructor(
        public readonly payload: CreateSessionPayload
    ){
        super()
    }
}