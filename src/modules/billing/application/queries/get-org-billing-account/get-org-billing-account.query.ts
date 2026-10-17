import { IQuery } from '@nestjs/cqrs';

export class GetOrgBillingAccountQuery implements IQuery {
  constructor(public readonly orgId: string) {}
}
