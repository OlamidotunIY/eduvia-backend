import { Command } from '@nestjs/cqrs';
import { AuthTokensResult } from './login.result';

export class LoginCommand extends Command<AuthTokensResult> {
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
