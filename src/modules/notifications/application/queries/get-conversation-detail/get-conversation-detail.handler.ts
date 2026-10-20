import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConversationDetailQuery } from './get-conversation-detail.query';
import { ConversationDetailDto } from '../dto/conversation.dto';
import {
  IConversationRepository,
  ConversationId,
  ConversationNotFoundError,
  UnauthorizedConversationParticipantError,
} from '../../../domain';

@QueryHandler(GetConversationDetailQuery)
export class GetConversationDetailHandler
  implements IQueryHandler<GetConversationDetailQuery, ConversationDetailDto>
{
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(query: GetConversationDetailQuery): Promise<ConversationDetailDto> {
    const conversation = await this.conversationRepository.findById(
      ConversationId.from(query.conversationId),
    );

    if (!conversation) {
      throw new ConversationNotFoundError(query.conversationId);
    }

    if (!conversation.participants.includes(query.userId)) {
      throw new UnauthorizedConversationParticipantError(
        query.userId,
        query.conversationId,
      );
    }

    return ConversationDetailDto.fromDomain(conversation);
  }
}
