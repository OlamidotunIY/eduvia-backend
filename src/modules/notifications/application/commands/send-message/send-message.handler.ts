import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendMessageCommand } from './send-message.command';
import {
  IConversationRepository,
  ConversationId,
  ConversationNotFoundError,
} from '../../../domain';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand, string> {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(command: SendMessageCommand): Promise<string> {
    const conversation = await this.conversationRepository.findById(
      ConversationId.from(command.conversationId),
    );

    if (!conversation) {
      throw new ConversationNotFoundError(command.conversationId);
    }

    const message = conversation.postMessage(
      command.senderId,
      command.content,
      command.attachmentUrl,
    );

    await this.conversationRepository.save(conversation);
    return message.id.toString();
  }
}
