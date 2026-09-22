import { Command } from '@nestjs/cqrs';

export class RequestPasswordResetCommand extends Command<void> {
  constructor(
    public readonly payload: {
      email: string;
      correlationId: string;
    },
  ) {
    super();
  }
}
