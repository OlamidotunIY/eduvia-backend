import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkNotificationReadCommand } from './mark-notification-read.command';
import {
  INotificationRepository,
  NotificationId,
  NotificationNotFoundError,
  BusinessRuleViolationError,
} from '../../../domain';

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadHandler implements ICommandHandler<MarkNotificationReadCommand, void> {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(command: MarkNotificationReadCommand): Promise<void> {
    const notification = await this.notificationRepository.findById(
      NotificationId.from(command.notificationId),
    );

    if (!notification) {
      throw new NotificationNotFoundError(command.notificationId);
    }

    if (notification.recipientId !== command.recipientId) {
      throw new BusinessRuleViolationError('You can only mark your own notifications as read.');
    }

    notification.markRead();
    await this.notificationRepository.save(notification);
  }
}
