import { Command } from '@nestjs/cqrs';

export class ChangePasswordCommand extends Command<void> {
  constructor(
    public readonly payload: {
      email: string;
      code: string;
      newPassword: string;
    },
  ) {
    super();
  }
}
