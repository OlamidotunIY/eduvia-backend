import { ForbiddenError } from "@modules/shared";


export class UserCannotCreateOrganization extends ForbiddenError {
    constructor(details?: unknown) {
        super('User cannot create organization', details);
        this.code = this.constructor.name;
    }
}
