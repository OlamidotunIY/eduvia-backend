import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReopenConversationCommand } from './reopen-conversation.command';
import {
  IConversationRepository,
  ConversationId,
  ConversationNotFoundError,
} from '../../../domain';

@CommandHandler(ReopenConversationCommand)
export class ReopenConversationHandler implements ICommandHandler<ReopenConversationCommand, void> {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(command: ReopenConversationCommand): Promise<void> {
    const conversation = await this.conversationRepository.findById(
      ConversationId.from(command.conversationId),
    );

    if (!conversation) {
      throw new ConversationNotFoundError(command.conversationId);
    }

    conversation.reopen(command.adminId);
    await this.conversationRepository.save(conversation);
  }
}
