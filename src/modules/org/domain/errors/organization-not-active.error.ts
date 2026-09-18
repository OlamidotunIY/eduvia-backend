import { BusinessRuleViolationError, NotFoundError } from "../../../shared";

export class OrganizationNotActiveError extends NotFoundError{
    constructor(message: string, details?: unknown){
        super(message, details);
        this.code = this.constructor.name
    }
}
