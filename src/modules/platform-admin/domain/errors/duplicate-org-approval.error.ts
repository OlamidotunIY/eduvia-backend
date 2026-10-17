import { ConflictError } from '@modules/shared/domain';

export class DuplicateOrgApprovalError extends ConflictError {
  constructor(orgId: string) {
    super(`An active approval review is already recorded for org '${orgId}'.`);
  }
}
