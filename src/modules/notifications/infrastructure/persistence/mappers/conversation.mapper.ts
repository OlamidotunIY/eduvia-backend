import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Conversation,
  ConversationId,
  ConversationType,
  ConversationStatus,
} from '../../../domain';
import {
  Conversation as PrismaConversation,
  Message as PrismaMessage,
} from '@generated/prisma/client';
import { MessageMapper } from './message.mapper';

@Injectable()
export class ConversationMapper implements IMapper<Conversation, PrismaConversation> {
  constructor(private readonly messageMapper: MessageMapper) {}

  toDomain(
    record: PrismaConversation & { messages?: PrismaMessage[] },
  ): Conversation {
    const messages = record.messages
      ? record.messages.map((m) => this.messageMapper.toDomain(m))
      : [];

    const participants = Array.isArray(record.participants)
      ? (record.participants as string[])
      : [];

    return Conversation.reconstitute({
      id: ConversationId.from(record.id),
      orgId: record.orgId,
      type: record.type as ConversationType,
      participants,
      studentId: record.studentId,
      parentId: record.parentId,
      subject: record.subject,
      status: record.status as ConversationStatus,
      lastMessageAt: record.lastMessageAt,
      messages,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: Conversation): PrismaConversation {
    return {
      id: entity.id.toString(),
      orgId: entity.orgId,
      type: entity.type,
      participants: entity.participants,
      studentId: entity.studentId,
      parentId: entity.parentId,
      subject: entity.subject,
      status: entity.status,
      lastMessageAt: entity.lastMessageAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
