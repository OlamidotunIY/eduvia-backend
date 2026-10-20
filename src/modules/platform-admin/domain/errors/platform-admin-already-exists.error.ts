import { ConflictError } from '@modules/shared/domain';

export class PlatformAdminAlreadyExistsError extends ConflictError {
  constructor(userId: string) {
    super(`User '${userId}' is already a platform admin.`);
  }
}
