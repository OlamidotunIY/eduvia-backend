import { Command } from "@nestjs/cqrs";
import { UpdateUserPayload, UpdateUserResult } from "./update-user.result";

export class UpdateUserCommand extends Command<UpdateUserResult>{
    constructor(
        public readonly payload: UpdateUserPayload
    ){
        super()
    }
}