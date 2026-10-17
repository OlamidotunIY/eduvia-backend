import { NotFoundError } from '@modules/shared/domain';

export class PlatformAdminNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`PlatformAdmin '${identifier}' was not found.`);
  }
}
