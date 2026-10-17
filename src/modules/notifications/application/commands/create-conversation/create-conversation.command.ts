import { ICommand } from '@nestjs/cqrs';
import { ConversationType } from '../../../domain';

export class CreateConversationCommand implements ICommand {
  constructor(
    public readonly orgId: string,
    public readonly type: ConversationType,
    public readonly participants: string[],
    public readonly studentId?: string | null,
    public readonly parentId?: string | null,
    public readonly subject?: string | null,
  ) {}
}
