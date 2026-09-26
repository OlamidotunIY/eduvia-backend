import { BadRequestError } from "@modules/shared";

export class OrganizationInvitationEpired extends BadRequestError {
    constructor(details?: unknown) {
        super('Organization invitation expired', details);
        this.code = this.constructor.name;
    }
}
