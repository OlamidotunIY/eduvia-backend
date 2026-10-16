import { NotFoundError } from "@modules/shared";

export class OrganizationNotFound extends NotFoundError {
  constructor(details?: unknown) {
    super('Organization not found', details);
    this.code = this.constructor.name;
  }
}
