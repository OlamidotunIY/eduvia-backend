import { ConflictError } from "../../../shared";

export class InvalidVerificationValue extends ConflictError {
    constructor(details?: unknown) {
        super(' Invalid verification value', details);
        this.code = this.constructor.name;
    }
}
