import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateNotificationCommand,
  MarkNotificationReadCommand,
  MarkAllNotificationsReadCommand,
  RegisterDeviceTokenCommand,
  RemoveDeviceTokenCommand,
} from '../../application/commands';
import {
  GetNotificationsQuery,
  GetUnreadNotificationCountQuery,
  NotificationDto,
} from '../../application/queries';
import {
  CreateNotificationDto,
  RegisterDeviceTokenDto,
} from '../dto';
import { NotificationStatus } from '../../domain';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<{ id: string }> {
    const id = await this.commandBus.execute(
      new CreateNotificationCommand(
        dto.recipientId,
        dto.type,
        dto.title,
        dto.body,
        dto.data,
        dto.channel,
      ),
    );
    return { id };
  }

  async getNotifications(
    recipientId: string,
    status?: NotificationStatus,
    limit?: number,
    offset?: number,
  ): Promise<NotificationDto[]> {
    return this.queryBus.execute(
      new GetNotificationsQuery(recipientId, status, limit, offset),
    );
  }

  async getUnreadCount(recipientId: string): Promise<{ unreadCount: number }> {
    return this.queryBus.execute(new GetUnreadNotificationCountQuery(recipientId));
  }

  async markRead(recipientId: string, notificationId?: string): Promise<{ success: boolean }> {
    if (notificationId) {
      await this.commandBus.execute(
        new MarkNotificationReadCommand(notificationId, recipientId),
      );
    } else {
      await this.commandBus.execute(
        new MarkAllNotificationsReadCommand(recipientId),
      );
    }
    return { success: true };
  }

  async registerDeviceToken(
    userId: string,
    dto: RegisterDeviceTokenDto,
  ): Promise<{ success: boolean }> {
    await this.commandBus.execute(
      new RegisterDeviceTokenCommand(userId, dto.token, dto.platform),
    );
    return { success: true };
  }

  async removeDeviceToken(token: string): Promise<{ success: boolean }> {
    await this.commandBus.execute(new RemoveDeviceTokenCommand(token));
    return { success: true };
  }
}
