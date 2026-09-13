import { ConflictError } from "../../../shared";

export class AuthAccountAlreadySuspendedError extends ConflictError {
    constructor(details?: unknown) {
        super('AuthAccount is already suspended', details);
        this.code = this.constructor.name;
    }
}