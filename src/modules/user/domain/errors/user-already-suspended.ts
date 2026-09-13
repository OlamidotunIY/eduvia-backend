import { BadRequestError, ConflictError } from "../../../shared";

export class UserAlreadySuspendedError extends ConflictError{
    constructor( details?: unknown){
        super('User already suspended', details);
        this.code = this.constructor.name;
    }
}