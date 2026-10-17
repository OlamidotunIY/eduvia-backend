import { IQuery } from '@nestjs/cqrs';
import { NotificationStatus } from '../../../domain';

export class GetNotificationsQuery implements IQuery {
  constructor(
    public readonly recipientId: string,
    public readonly status?: NotificationStatus,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
