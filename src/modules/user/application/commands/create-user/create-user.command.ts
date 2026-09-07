import { Command } from "@nestjs/cqrs";
import { CreateUserPayload, CreateUserResult } from "./create-user.result";

export class CreateUserCommand extends Command<CreateUserResult> {
    constructor(
        public readonly payload: CreateUserPayload
    ){
        super()
    }
}