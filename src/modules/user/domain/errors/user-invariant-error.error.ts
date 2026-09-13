import { BusinessRuleViolationError } from "../../../shared";

export class UserInvariantError extends BusinessRuleViolationError{
    constructor(message: string, details?: unknown){
        super(message, details);
        this.code = this.constructor.name
    }
}