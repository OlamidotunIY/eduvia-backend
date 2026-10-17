import { NotificationChannel, NotificationType } from '../../domain';

export class CreateNotificationDto {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  channel?: NotificationChannel;
}
