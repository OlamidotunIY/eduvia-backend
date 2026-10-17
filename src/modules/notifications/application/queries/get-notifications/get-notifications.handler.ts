import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetNotificationsQuery } from './get-notifications.query';
import { NotificationDto } from '../dto/notification.dto';
import { INotificationRepository } from '../../../domain';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler
  implements IQueryHandler<GetNotificationsQuery, NotificationDto[]>
{
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(query: GetNotificationsQuery): Promise<NotificationDto[]> {
    const notifications = await this.notificationRepository.findByRecipientId(
      query.recipientId,
      {
        status: query.status,
        limit: query.limit,
        offset: query.offset,
      },
    );

    return notifications.map((n) => NotificationDto.fromDomain(n));
  }
}
