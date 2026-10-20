import { ICommand } from '@nestjs/cqrs';

export class MarkAllNotificationsReadCommand implements ICommand {
  constructor(public readonly recipientId: string) {}
}
