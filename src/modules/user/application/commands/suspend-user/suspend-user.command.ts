import { Command } from "@nestjs/cqrs";
import { SuspendUserPayload } from "./suspend-user.result";

export class SuspendUserCommand extends Command<void> {
    constructor(
        public readonly payload: SuspendUserPayload,
    ) {
        super();
    }
}