import { NotFoundError } from '@modules/shared';

export class OrgAnalyticsSnapshotNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`Org analytics snapshot for "${identifier}" was not found.`);
    this.code = this.constructor.name;
  }
}
