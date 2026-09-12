import { DomainError } from './domain.error';

class BusinessRuleViolationError extends DomainError {
  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}

export { BusinessRuleViolationError };
