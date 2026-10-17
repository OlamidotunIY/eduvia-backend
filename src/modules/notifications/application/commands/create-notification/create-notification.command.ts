import { ICommand } from '@nestjs/cqrs';
import { NotificationChannel, NotificationType } from '../../../domain';

export class CreateNotificationCommand implements ICommand {
  constructor(
    public readonly recipientId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly body: string,
    public readonly data?: Record<string, any>,
    public readonly channel?: NotificationChannel,
  ) {}
}
