import { Command } from '@nestjs/cqrs';

export class MarkEmailVerifiedCommand extends Command<void> {
  constructor(public readonly payload: { userId: string }) {
    super();
  }
}
