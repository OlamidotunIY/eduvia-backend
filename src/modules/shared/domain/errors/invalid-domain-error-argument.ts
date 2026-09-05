import { DomainError } from './domain-error';
import { DomainErrorCode } from './domain-error-code';

class InvalidDomainArgumentError extends DomainError {
  constructor(
    code: DomainErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(code, message, details);
  }
}

export { InvalidDomainArgumentError };