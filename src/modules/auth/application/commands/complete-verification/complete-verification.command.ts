import { Command } from "@nestjs/cqrs";
import { CompleteVerificationPayload } from "./complete-verification.result";

export class CompleteVerificationCommand extends Command<void> {
    constructor(
        public readonly payload: CompleteVerificationPayload,
    ) {
        super();
    }
}