import { ConflictError } from '@modules/shared/domain';

export class DuplicateSubscriptionError extends ConflictError {
  constructor(studentId: string, subjectId: string) {
    super(`Student '${studentId}' already has an active subscription for subject '${subjectId}'.`);
  }
}
