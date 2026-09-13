import { DomainError } from './domain.error';

class ConflictError extends DomainError {
  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}

export { ConflictError };
