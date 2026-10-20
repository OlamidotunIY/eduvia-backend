import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { Message, MessageId, MessageStatus } from '../../../domain';
import { Message as PrismaMessage } from '@generated/prisma/client';

@Injectable()
export class MessageMapper implements IMapper<Message, PrismaMessage> {
  toDomain(record: PrismaMessage): Message {
    return Message.reconstitute({
      id: MessageId.from(record.id),
      conversationId: record.conversationId,
      senderId: record.senderId,
      content: record.content,
      attachmentUrl: record.attachmentUrl,
      status: record.status as MessageStatus,
      sentAt: record.sentAt,
      deliveredAt: record.deliveredAt,
      readAt: record.readAt,
    });
  }

  toPersistence(entity: Message): PrismaMessage {
    return {
      id: entity.id.toString(),
      conversationId: entity.conversationId,
      senderId: entity.senderId,
      content: entity.content,
      attachmentUrl: entity.attachmentUrl,
      status: entity.status,
      sentAt: entity.sentAt,
      deliveredAt: entity.deliveredAt,
      readAt: entity.readAt,
    };
  }
}
