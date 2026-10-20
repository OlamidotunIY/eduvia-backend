import { IQuery } from '@nestjs/cqrs';

export class GetUserConversationsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly orgId?: string,
  ) {}
}
