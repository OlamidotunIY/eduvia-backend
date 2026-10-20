import { NotFoundError } from '@modules/shared/domain';

export class MessageNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Message with ID '${id}' was not found.`);
  }
}
