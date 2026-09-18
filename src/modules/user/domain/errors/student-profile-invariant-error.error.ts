import { BusinessRuleViolationError } from "../../../shared";

export class StudentProfileInvariantError extends BusinessRuleViolationError{
    constructor(message: string, details?: unknown){
        super(message, details);
        this.code = this.constructor.name
    }
}
