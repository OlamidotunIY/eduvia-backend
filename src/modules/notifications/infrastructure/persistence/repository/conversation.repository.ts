import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Conversation,
  ConversationId,
  IConversationRepository,
  ConversationType,
} from '../../../domain';
import { Conversation as PrismaConversation } from '@generated/prisma/client';
import { ConversationMapper } from '../mappers/conversation.mapper';
import { MessageMapper } from '../mappers/message.mapper';

@Injectable()
export class PrismaConversationRepository
  extends PrismaBaseRepository<ConversationId, Conversation, PrismaConversation>
  implements IConversationRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly conversationMapper: ConversationMapper,
    protected readonly messageMapper: MessageMapper,
  ) {
    super(prisma, conversationMapper);
  }

  protected get delegate() {
    return this.prisma.conversation;
  }

  public override async findById(id: ConversationId | string): Promise<Conversation | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.conversation.findUnique({
      where: { id: rawId },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
    });
    return record ? this.conversationMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<Conversation[]> {
    const records = await this.prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return records.map((record) => this.conversationMapper.toDomain(record));
  }

  public override async save(entity: Conversation): Promise<void> {
    const data = this.conversationMapper.toPersistence(entity);
    const conversationId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.conversation.upsert({
        where: { id: conversationId },
        create: {
          id: conversationId,
          ...data,
        },
        update: data,
      });

      for (const message of entity.messages) {
        const messageData = this.messageMapper.toPersistence(message);
        const messageId = message.id.unpack();
        await tx.message.upsert({
          where: { id: messageId },
          create: {
            id: messageId,
            ...messageData,
          },
          update: messageData,
        });
      }

      for (const event of events) {
        await tx.outboxMessage.create({
          data: {
            id: typeof event.eventId === 'string' ? event.eventId : String(event.eventId),
            eventId: event.eventId,
            type: event.eventName,
            aggregateType: entity.constructor.name,
            aggregateId: entity.getId(),
            payload: event.payload as object,
            correlationId: event.correlationId,
            occurredAt: event.occurredAt,
            status: 'PENDING' as any,
          },
        });
      }
    });
  }

  public async findByParticipant(userId: string, orgId?: string): Promise<Conversation[]> {
    const where: any = {};
    if (orgId) {
      where.orgId = orgId;
    }

    const records = await this.prisma.conversation.findMany({
      where,
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const matching = records.filter(
      (r) => Array.isArray(r.participants) && (r.participants as string[]).includes(userId),
    );

    return matching.map((r) => this.conversationMapper.toDomain(r));
  }

  public async findStudentTeacherConversation(
    orgId: string,
    studentId: string,
    teacherId: string,
  ): Promise<Conversation | null> {
    const records = await this.prisma.conversation.findMany({
      where: {
        orgId,
        type: ConversationType.student_teacher,
        studentId,
      },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
    });

    const matching = records.find(
      (r) => Array.isArray(r.participants) && (r.participants as string[]).includes(teacherId),
    );

    return matching ? this.conversationMapper.toDomain(matching) : null;
  }

  public async findParentAdminConversation(
    orgId: string,
    parentId: string,
  ): Promise<Conversation | null> {
    const record = await this.prisma.conversation.findFirst({
      where: {
        orgId,
        type: ConversationType.parent_admin,
        parentId,
      },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
    });

    return record ? this.conversationMapper.toDomain(record) : null;
  }
}
