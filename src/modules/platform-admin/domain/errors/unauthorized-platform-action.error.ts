import { ForbiddenError } from '@modules/shared/domain';

export class UnauthorizedPlatformActionError extends ForbiddenError {
  constructor(message: string = 'You do not have permission to perform this platform administration action.') {
    super(message);
  }
}
