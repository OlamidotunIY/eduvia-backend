import { IQuery } from '@nestjs/cqrs';

export class ListOrgSubscriptionPlansQuery implements IQuery {
  constructor(
    public readonly orgId: string,
    public readonly activeOnly: boolean = false,
  ) {}
}
