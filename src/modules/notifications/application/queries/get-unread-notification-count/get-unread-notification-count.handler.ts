import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUnreadNotificationCountQuery } from './get-unread-notification-count.query';
import { INotificationRepository } from '../../../domain';

@QueryHandler(GetUnreadNotificationCountQuery)
export class GetUnreadNotificationCountHandler
  implements IQueryHandler<GetUnreadNotificationCountQuery, { unreadCount: number }>
{
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(
    query: GetUnreadNotificationCountQuery,
  ): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationRepository.countUnreadByRecipientId(
      query.recipientId,
    );
    return { unreadCount };
  }
}
