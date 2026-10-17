import { ICommand } from '@nestjs/cqrs';

export class MarkNotificationReadCommand implements ICommand {
  constructor(
    public readonly notificationId: string,
    public readonly recipientId: string,
  ) {}
}
