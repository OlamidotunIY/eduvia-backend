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
    return this.conversationsService.getUserConversations(user.id, orgId);
  }

  @Post()
  async createConversation(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationsService.createConversation(user.id, dto);
  }

  @Get(':id')
  async getConversationDetail(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.conversationsService.getConversationDetail(id, user.id);
  }

  @Post(':id/messages')
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversationsService.sendMessage(id, user.id, dto);
  }

  @Post(':id/close')
  async closeConversation(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.conversationsService.closeConversation(id, user.id);
  }

  @Post(':id/reopen')
  async reopenConversation(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.conversationsService.reopenConversation(id, user.id);
  }
}
