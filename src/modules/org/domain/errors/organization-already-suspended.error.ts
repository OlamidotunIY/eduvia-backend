import { ConflictError } from "../../../shared";

export class OrganizationAlreadySuspendedError extends ConflictError{
    constructor( details?: unknown){
        super('User already suspended', details);
        this.code = this.constructor.name;
    }
}
