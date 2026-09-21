import { DomainError } from './domain.error';

class BadRequestError extends DomainError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    this.code = this.constructor.name;
  }
}

export { BadRequestError };
