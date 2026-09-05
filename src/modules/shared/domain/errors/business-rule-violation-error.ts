import { DomainError } from './domain-error';
import { DomainErrorCode } from './domain-error-code';

class BusinessRuleViolationError extends DomainError {
  constructor(
    code: DomainErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(code, message, details);
  }
}

export { BusinessRuleViolationError };