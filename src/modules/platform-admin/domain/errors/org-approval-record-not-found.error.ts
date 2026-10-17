import { NotFoundError } from '@modules/shared/domain';

export class OrgApprovalRecordNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`OrgApprovalRecord for org '${identifier}' was not found.`);
  }
}
