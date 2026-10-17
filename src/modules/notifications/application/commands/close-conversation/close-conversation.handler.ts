import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloseConversationCommand } from './close-conversation.command';
import {
  IConversationRepository,
  ConversationId,
  ConversationNotFoundError,
} from '../../../domain';

@CommandHandler(CloseConversationCommand)
export class CloseConversationHandler implements ICommandHandler<CloseConversationCommand, void> {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(command: CloseConversationCommand): Promise<void> {
    const conversation = await this.conversationRepository.findById(
      ConversationId.from(command.conversationId),
    );

    if (!conversation) {
      throw new ConversationNotFoundError(command.conversationId);
    }

    conversation.close(command.adminId);
    await this.conversationRepository.save(conversation);
  }
}
