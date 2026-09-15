import { Command } from "@nestjs/cqrs";
import { CompleteVerificationPayload } from "./complete-verification.result";

import { IssueAuthTokensResult } from '../issue-auth-tokens/issue-auth-tokens.result';

export class CompleteVerificationCommand extends Command<IssueAuthTokensResult> {
    constructor(
        public readonly payload: CompleteVerificationPayload,
    ) {
        super();
    }
}
