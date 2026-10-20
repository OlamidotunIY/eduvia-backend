import { BusinessRuleViolationError } from '@modules/shared/domain';

export class UnauthorizedConversationParticipantError extends BusinessRuleViolationError {
  constructor(userId: string, conversationId: string) {
    super(`User '${userId}' is not a permitted participant of conversation '${conversationId}'.`);
  }
}
