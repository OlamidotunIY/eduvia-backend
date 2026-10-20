import { BadRequestError } from '@modules/shared/domain';

export class InvalidAiJobStateError extends BadRequestError {
  constructor(action: string, currentState: string) {
    super(`Cannot perform '${action}' on AIJob with status '${currentState}'.`);
  }
}
