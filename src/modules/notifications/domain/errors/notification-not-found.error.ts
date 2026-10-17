import { NotFoundError } from '@modules/shared/domain';

export class NotificationNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Notification with ID '${id}' was not found.`);
  }
}
