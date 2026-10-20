import { NotFoundError } from '@modules/shared/domain';

export class OrgBillingAccountNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`OrgBillingAccount '${identifier}' was not found.`);
  }
}
