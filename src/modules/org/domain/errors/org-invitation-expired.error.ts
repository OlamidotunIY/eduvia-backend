import { BadRequestError } from "@modules/shared";

export class OrganizationInvitationExpired extends BadRequestError {
    constructor(details?: unknown) {
        super('Organization invitation expired', details);
        this.code = this.constructor.name;
    }
}
