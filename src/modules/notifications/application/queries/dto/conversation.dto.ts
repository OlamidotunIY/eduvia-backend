import { Conversation, Message } from '../../../domain';

export class MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  status: string;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;

  public static fromDomain(entity: Message): MessageDto {
    const dto = new MessageDto();
    dto.id = entity.id.toString();
    dto.conversationId = entity.conversationId;
    dto.senderId = entity.senderId;
    dto.content = entity.content;
    dto.attachmentUrl = entity.attachmentUrl;
    dto.status = entity.status;
    dto.sentAt = entity.sentAt.toISOString();
    dto.deliveredAt = entity.deliveredAt ? entity.deliveredAt.toISOString() : null;
    dto.readAt = entity.readAt ? entity.readAt.toISOString() : null;
    return dto;
  }
}

export class ConversationSummaryDto {
  id: string;
  orgId: string;
  type: string;
  participants: string[];
  studentId: string | null;
  parentId: string | null;
  subject: string | null;
  status: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;

  public static fromDomain(entity: Conversation): ConversationSummaryDto {
    const dto = new ConversationSummaryDto();
    dto.id = entity.id.toString();
    dto.orgId = entity.orgId;
    dto.type = entity.type;
    dto.participants = entity.participants;
    dto.studentId = entity.studentId;
    dto.parentId = entity.parentId;
    dto.subject = entity.subject;
    dto.status = entity.status;
    dto.lastMessageAt = entity.lastMessageAt ? entity.lastMessageAt.toISOString() : null;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}

export class ConversationDetailDto extends ConversationSummaryDto {
  messages: MessageDto[];

  public static override fromDomain(entity: Conversation): ConversationDetailDto {
    const base = ConversationSummaryDto.fromDomain(entity);
    const dto = new ConversationDetailDto();
    Object.assign(dto, base);
    dto.messages = entity.messages.map((m) => MessageDto.fromDomain(m));
    return dto;
  }
}
