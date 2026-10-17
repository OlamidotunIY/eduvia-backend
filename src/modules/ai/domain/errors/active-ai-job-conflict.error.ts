import { ConflictError } from '@modules/shared/domain';

export class ActiveAiJobConflictError extends ConflictError {
  constructor(type: string, relatedEntityId: string) {
    super(
      `An active AI job of type '${type}' already exists for entity '${relatedEntityId}'.`,
    );
  }
}
