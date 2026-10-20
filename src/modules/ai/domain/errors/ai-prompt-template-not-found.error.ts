import { NotFoundError } from '@modules/shared/domain';

export class AiPromptTemplateNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`AIPromptTemplate '${identifier}' was not found.`);
  }
}
