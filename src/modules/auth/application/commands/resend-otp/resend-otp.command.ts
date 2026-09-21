import { Command } from '@nestjs/cqrs';

export class ResendOtpCommand extends Command<void> {
  constructor(
    public readonly payload: {
      authAccountId: string;
      correlationId: string;
    },
  ) {
    super();
  }
}
