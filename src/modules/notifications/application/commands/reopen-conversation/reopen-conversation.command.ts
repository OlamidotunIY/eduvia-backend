import { ICommand } from '@nestjs/cqrs';

export class ReopenConversationCommand implements ICommand {
  constructor(
    public readonly conversationId: string,
    public readonly adminId: string,
  ) {}
}
