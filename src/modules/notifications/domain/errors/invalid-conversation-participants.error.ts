import { BadRequestError } from '@modules/shared/domain';

export class InvalidConversationParticipantsError extends BadRequestError {
  constructor(message: string) {
    super(`Invalid conversation participants: ${message}`);
  }
}
