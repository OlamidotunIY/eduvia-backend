import { ConflictError } from "../../../shared";

export class VerificationNotPending extends ConflictError{
    constructor(details?: unknown){
        super('Verification is not longer pending', details);
        this.code = this.constructor.name
    }
}
