import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateConversationCommand,
  SendMessageCommand,
  CloseConversationCommand,
  ReopenConversationCommand,
} from '../../application/commands';
import {
  GetUserConversationsQuery,
  GetConversationDetailQuery,
  ConversationSummaryDto,
  ConversationDetailDto,
} from '../../application/queries';
import { CreateConversationDto, SendMessageDto } from '../dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createConversation(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<{ id: string }> {
    const participants = dto.participants.includes(userId)
      ? dto.participants
      : [userId, ...dto.participants];

    const id = await this.commandBus.execute(
      new CreateConversationCommand(
        dto.orgId,
        dto.type,
        participants,
        dto.studentId,
        dto.parentId,
        dto.subject,
      ),
    );

    return { id };
  }

  async getUserConversations(
    userId: string,
    orgId?: string,
  ): Promise<ConversationSummaryDto[]> {
    return this.queryBus.execute(new GetUserConversationsQuery(userId, orgId));
  }

  async getConversationDetail(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDetailDto> {
    return this.queryBus.execute(
      new GetConversationDetailQuery(conversationId, userId),
    );
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    dto: SendMessageDto,
  ): Promise<{ messageId: string }> {
    const messageId = await this.commandBus.execute(
      new SendMessageCommand(
        conversationId,
        senderId,
        dto.content,
        dto.attachmentUrl,
      ),
    );
    return { messageId };
  }

  async closeConversation(
    conversationId: string,
    adminId: string,
  ): Promise<{ success: boolean }> {
    await this.commandBus.execute(
      new CloseConversationCommand(conversationId, adminId),
    );
    return { success: true };
  }

  async reopenConversation(
    conversationId: string,
    adminId: string,
  ): Promise<{ success: boolean }> {
    await this.commandBus.execute(
      new ReopenConversationCommand(conversationId, adminId),
    );
    return { success: true };
  }
}
