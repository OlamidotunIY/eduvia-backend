import { Command } from '@nestjs/cqrs';
import { CompleteVerificationPayload } from './complete-verification.result';

export class CompleteVerificationCommand extends Command<CompleteVerificationPayload> {
  constructor(
    public readonly payload: {
      email: string;
      code: string;
      ipAddress: string;
      userAgent: string;
      correlationId: string;
    },
  ) {
    super();
  }
}
