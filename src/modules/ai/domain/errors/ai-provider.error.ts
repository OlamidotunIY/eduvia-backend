import { DomainError } from '@modules/shared/domain';

export class AiProviderError extends DomainError {
  constructor(provider: string, message: string, details?: unknown) {
    super(`AI Provider '${provider}' failed: ${message}`, details);
  }
}
