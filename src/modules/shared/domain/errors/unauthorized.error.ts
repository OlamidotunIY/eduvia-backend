import { DomainError } from './domain.error';

export class UnauthorizedError extends DomainError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    this.code = this.constructor.name;
  }
}
