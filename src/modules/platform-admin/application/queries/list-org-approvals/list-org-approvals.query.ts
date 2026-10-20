import { IQuery } from '@nestjs/cqrs';

export class ListOrgApprovalsQuery implements IQuery {
  constructor(public readonly orgId?: string) {}
}
