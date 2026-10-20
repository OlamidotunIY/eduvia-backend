import { Command } from '@nestjs/cqrs';

export class ResendOtpCommand extends Command<void> {
  constructor(
    public readonly payload: {
      email: string;
      correlationId: string;
    },
  ) {
    super();
  }
}
