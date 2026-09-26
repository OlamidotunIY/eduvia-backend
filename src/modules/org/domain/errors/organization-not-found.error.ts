import { NotFoundError } from "@modules/shared";

export class OrganizationNotFound extends NotFoundError {
    constructor(details?: unknown) {
        super('Organization invitation expired', details);
        this.code = this.constructor.name;
    }
}
