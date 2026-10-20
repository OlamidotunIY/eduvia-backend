import { Command } from '@nestjs/cqrs';
import {  CompleteVerificationResult } from './complete-verification.result';

export class CompleteVerificationCommand extends Command<CompleteVerificationResult> {
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
