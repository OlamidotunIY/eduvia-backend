import { Command } from '@nestjs/cqrs';
import { IssueAuthTokensPayload, IssueAuthTokensResult } from './issue-auth-tokens.result';

export class IssueAuthTokensCommand extends Command<IssueAuthTokensResult> {
  constructor(public readonly payload: IssueAuthTokensPayload) {
    super();
  }
}
