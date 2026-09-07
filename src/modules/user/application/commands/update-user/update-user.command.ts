import { Command } from "@nestjs/cqrs";
import { UpdateUserPayload } from "./update-user.result";

export class UpdateUserCommand extends Command<void>{
    constructor(
        public readonly payload: UpdateUserPayload
    ){
        super()
    }
}