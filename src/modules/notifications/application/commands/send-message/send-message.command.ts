import { ICommand } from '@nestjs/cqrs';

export class SendMessageCommand implements ICommand {
  constructor(
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly content: string,
    public readonly attachmentUrl?: string | null,
  ) {}
}
