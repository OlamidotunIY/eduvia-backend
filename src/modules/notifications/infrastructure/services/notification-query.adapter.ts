import { Injectable } from '@nestjs/common';
import {
  INotificationsQueryPort,
  SharedNotificationDto,
} from '@modules/shared';
import { INotificationRepository } from '../../domain';

@Injectable()
export class NotificationQueryAdapter implements INotificationsQueryPort {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnreadByRecipientId(userId);
  }

  async getRecentNotifications(
    userId: string,
    limit = 10,
  ): Promise<SharedNotificationDto[]> {
    const notifications = await this.notificationRepository.findByRecipientId(userId, {
      limit,
    });

    return notifications.map((n) => ({
      id: n.id.toString(),
      recipientId: n.recipientId,
      type: n.type,
      title: n.title,
      body: n.body,
      channel: n.channel,
      status: n.status,
      deliveredAt: n.deliveredAt,
      readAt: n.readAt,
      createdAt: n.createdAt,
    }));
  }
}
