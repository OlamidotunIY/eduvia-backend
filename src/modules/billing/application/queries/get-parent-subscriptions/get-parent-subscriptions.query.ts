import { IQuery } from '@nestjs/cqrs';

export class GetParentSubscriptionsQuery implements IQuery {
  constructor(public readonly parentId: string) {}
}
