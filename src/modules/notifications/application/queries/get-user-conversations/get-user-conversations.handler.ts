import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserConversationsQuery } from './get-user-conversations.query';
import { ConversationSummaryDto } from '../dto/conversation.dto';
import { IConversationRepository } from '../../../domain';

@QueryHandler(GetUserConversationsQuery)
export class GetUserConversationsHandler
  implements IQueryHandler<GetUserConversationsQuery, ConversationSummaryDto[]>
{
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(query: GetUserConversationsQuery): Promise<ConversationSummaryDto[]> {
    const conversations = await this.conversationRepository.findByParticipant(
      query.userId,
      query.orgId,
    );

    return conversations.map((c) => ConversationSummaryDto.fromDomain(c));
  }
}
