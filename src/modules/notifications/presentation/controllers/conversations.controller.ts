import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { ConversationsService } from '../services/conversations.service';
import { CreateConversationDto, SendMessageDto } from '../dto';

@Controller('conversations')
@UseGuards(AuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async listConversations(
    @CurrentUser() user: CurrentUserPayload,
    @Query('orgId') orgId?: string,
  ) {
    const userId = user.userId ?? (user as any).id;
    return this.conversationsService.getUserConversations(userId, orgId);
  }

  @Post()
  async createConversation(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateConversationDto,
  ) {
    const userId = user.userId ?? (user as any).id;
    return this.conversationsService.createConversation(userId, dto);
  }

  @Get(':id')
  async getConversationDetail(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const userId = user.userId ?? (user as any).id;
    return this.conversationsService.getConversationDetail(id, userId);
  }

  @Post(':id/messages')
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SendMessageDto,
  ) {
    const userId = user.userId ?? (user as any).id;
    return this.conversationsService.sendMessage(id, userId, dto);
  }

  @Post(':id/close')
  async closeConversation(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const userId = user.userId ?? (user as any).id;
    return this.conversationsService.closeConversation(id, userId);
  }

  @Post(':id/reopen')
  async reopenConversation(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const userId = user.userId ?? (user as any).id;
    return this.conversationsService.reopenConversation(id, userId);
  }
}
