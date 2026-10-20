import { ConflictError } from '@modules/shared/domain';

export class AiPromptTemplateInvariantError extends ConflictError {
  constructor(message: string) {
    super(message);
  }
}
