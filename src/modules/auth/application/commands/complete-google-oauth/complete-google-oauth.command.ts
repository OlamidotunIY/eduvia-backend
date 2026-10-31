import { Command } from '@nestjs/cqrs';
import type { CompleteGoogleOAuthResult } from './complete-google-oauth.result';

export class CompleteGoogleOAuthCommand extends Command<CompleteGoogleOAuthResult> {
  constructor(
    public readonly payload: {
      code?: string;
      state?: string;
      ipAddress: string;
      userAgent: string;
    },
  ) {
    super();
  }
}
