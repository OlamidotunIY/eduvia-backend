import { Command } from "@nestjs/cqrs";
import { SuspendAuthAccountPayload } from "./suspend-auth-account.result";

export class SuspendAuthAccountCommand extends Command<void> {
    constructor(
        public readonly payload: SuspendAuthAccountPayload,
    ) {
        super();
    }
}