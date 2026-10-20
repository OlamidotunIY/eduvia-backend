import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { Message, MessageId, IMessageRepository, MessageStatus } from '../../../domain';
import { MessageMapper } from '../mappers/message.mapper';

@Injectable()
export class PrismaMessageRepository implements IMessageRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageMapper: MessageMapper,
  ) {}

  public async findById(id: MessageId): Promise<Message | null> {
    const record = await this.prisma.message.findUnique({
      where: { id: id.unpack() },
    });
    return record ? this.messageMapper.toDomain(record) : null;
  }

  public async findByConversationId(
    conversationId: string,
    limit?: number,
    offset?: number,
  ): Promise<Message[]> {
    const records = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { sentAt: 'asc' },
      skip: offset ?? 0,
      take: limit ?? 50,
    });
    return records.map((r) => this.messageMapper.toDomain(r));
  }

  public async save(message: Message): Promise<void> {
    const data = this.messageMapper.toPersistence(message);
    const messageId = message.id.unpack();

    await this.prisma.message.upsert({
      where: { id: messageId },
      create: {
        id: messageId,
        ...data,
      },
      update: data,
    });
  }

  public async markAsRead(conversationId: string, readerUserId: string): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: readerUserId },
        status: { not: MessageStatus.read },
      },
      data: {
        status: MessageStatus.read,
        readAt: new Date(),
      },
    });
  }
}
