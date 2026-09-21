import { Command } from '@nestjs/cqrs';
import { IssueAuthTokensResult } from '../issue-auth-tokens/issue-auth-tokens.result';

export class LoginCommand extends Command<IssueAuthTokensResult> {
  constructor(
    public readonly payload: {
      email: string;
      passwordRaw: string;
      ipAddress: string;
      userAgent: string;
      correlationId: string;
    },
  ) {
    super();
  }
}
