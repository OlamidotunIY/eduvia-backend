import { ConflictError } from "../../../shared";

export class AuthAccountSuspendedError extends ConflictError {
    constructor(details?: unknown) {
        super('AuthAccount is  suspended', details);
        this.code = this.constructor.name;
    }
}
