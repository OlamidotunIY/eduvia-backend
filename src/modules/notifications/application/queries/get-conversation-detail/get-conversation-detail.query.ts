import { IQuery } from '@nestjs/cqrs';

export class GetConversationDetailQuery implements IQuery {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
  ) {}
}
