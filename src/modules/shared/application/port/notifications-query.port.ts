export interface SharedNotificationDto {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  body: string;
  channel: string;
  status: string;
  deliveredAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
}

export abstract class INotificationsQueryPort {
  public abstract getUnreadCount(userId: string): Promise<number>;

  public abstract getRecentNotifications(
    userId: string,
    limit?: number,
  ): Promise<SharedNotificationDto[]>;
}
