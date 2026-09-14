import { Command } from '@nestjs/cqrs';
import { LogoutPayload } from './logout.result';

export class LogoutCommand extends Command<void> {
  constructor(public readonly payload: LogoutPayload) {
    super();
  }
}
