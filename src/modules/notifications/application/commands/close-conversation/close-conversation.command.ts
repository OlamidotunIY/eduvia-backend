import { ICommand } from '@nestjs/cqrs';

export class CloseConversationCommand implements ICommand {
  constructor(
    public readonly conversationId: string,
    public readonly adminId: string,
  ) {}
}
