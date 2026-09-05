import { DomainError } from './domain-error';
import { DomainErrorCode } from './domain-error-code';

class NotFoundError extends DomainError {
  constructor(
    code: DomainErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(code, message, details);
  }
}

export { NotFoundError };