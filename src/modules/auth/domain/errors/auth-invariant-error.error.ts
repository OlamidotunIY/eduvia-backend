import { BusinessRuleViolationError } from "../../../shared";

class AuthInvariantError extends BusinessRuleViolationError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    this.code = this.constructor.name;
  }
}

export { AuthInvariantError };
