import { Message } from '../entities/message.entity';
import { MessageId } from '../value-objects';

export abstract class IMessageRepository {
  public abstract findById(id: MessageId): Promise<Message | null>;

  public abstract findByConversationId(
    conversationId: string,
    limit?: number,
    offset?: number,
  ): Promise<Message[]>;

  public abstract save(message: Message): Promise<void>;

  public abstract markAsRead(conversationId: string, readerUserId: string): Promise<void>;
}
