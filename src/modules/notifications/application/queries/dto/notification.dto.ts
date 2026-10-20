import { Notification } from '../../../domain';

export class NotificationDto {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  channel: string;
  status: string;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;

  public static fromDomain(entity: Notification): NotificationDto {
    const dto = new NotificationDto();
    dto.id = entity.id.toString();
    dto.recipientId = entity.recipientId;
    dto.type = entity.type;
    dto.title = entity.title;
    dto.body = entity.body;
    dto.data = entity.data;
    dto.channel = entity.channel;
    dto.status = entity.status;
    dto.deliveredAt = entity.deliveredAt ? entity.deliveredAt.toISOString() : null;
    dto.readAt = entity.readAt ? entity.readAt.toISOString() : null;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
