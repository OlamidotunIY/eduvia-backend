import { NotFoundError } from '@modules/shared/domain';

export class ConversationNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Conversation with ID '${id}' was not found.`);
  }
}
