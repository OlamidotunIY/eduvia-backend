import { IQuery } from '@nestjs/cqrs';

export class GetUnreadNotificationCountQuery implements IQuery {
  constructor(public readonly recipientId: string) {}
}
