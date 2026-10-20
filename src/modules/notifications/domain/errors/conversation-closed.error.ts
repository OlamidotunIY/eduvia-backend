import { BusinessRuleViolationError } from '@modules/shared/domain';

export class ConversationClosedError extends BusinessRuleViolationError {
  constructor(conversationId: string) {
    super(`Cannot post message or modify closed conversation '${conversationId}'.`);
  }
}
