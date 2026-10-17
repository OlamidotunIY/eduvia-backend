import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateNotificationCommand } from './create-notification.command';
import { INotificationRepository, Notification } from '../../../domain';

@CommandHandler(CreateNotificationCommand)
export class CreateNotificationHandler implements ICommandHandler<CreateNotificationCommand, string> {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(command: CreateNotificationCommand): Promise<string> {
    const notification = Notification.create({
      recipientId: command.recipientId,
      type: command.type,
      title: command.title,
      body: command.body,
      data: command.data,
      channel: command.channel,
    });

    await this.notificationRepository.save(notification);
    return notification.id.toString();
  }
}
