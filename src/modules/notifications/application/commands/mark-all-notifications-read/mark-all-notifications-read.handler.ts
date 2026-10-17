import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkAllNotificationsReadCommand } from './mark-all-notifications-read.command';
import { INotificationRepository } from '../../../domain';

@CommandHandler(MarkAllNotificationsReadCommand)
export class MarkAllNotificationsReadHandler
  implements ICommandHandler<MarkAllNotificationsReadCommand, void>
{
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(command: MarkAllNotificationsReadCommand): Promise<void> {
    await this.notificationRepository.markAllReadByRecipientId(command.recipientId);
  }
}
