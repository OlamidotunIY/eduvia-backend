import { IQuery } from '@nestjs/cqrs';

export class GetBillingHistoryQuery implements IQuery {
  constructor(
    public readonly orgId: string,
    public readonly subscriptionId?: string,
    public readonly limit?: number,
  ) {}
}
