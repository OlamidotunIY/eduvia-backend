import { NotFoundError } from "@modules/shared";

export class OrganizationUserNotFound extends NotFoundError {
    constructor(details?: unknown) {
        super('User not found', details);
        this.code = this.constructor.name;
    }
}
