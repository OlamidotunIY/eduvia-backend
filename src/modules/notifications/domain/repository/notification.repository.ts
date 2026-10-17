import { BaseRepository } from '@modules/shared/domain';
import { NotificationId, NotificationStatus } from '../value-objects';
import { Notification } from '../model/Notification';

export interface NotificationFilter {
  status?: NotificationStatus;
  limit?: number;
  offset?: number;
}

export abstract class INotificationRepository extends BaseRepository<Notification, NotificationId> {
  public abstract findByRecipientId(
    recipientId: string,
    filter?: NotificationFilter,
  ): Promise<Notification[]>;

  public abstract countUnreadByRecipientId(recipientId: string): Promise<number>;

  public abstract markAllReadByRecipientId(recipientId: string): Promise<void>;

  public abstract deleteOlderThan(cutoffDate: Date): Promise<number>;
}
