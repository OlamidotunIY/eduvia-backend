import { IQuery } from '@nestjs/cqrs';

export class GetParentSubscriptionByIdQuery implements IQuery {
  constructor(public readonly subscriptionId: string) {}
}
