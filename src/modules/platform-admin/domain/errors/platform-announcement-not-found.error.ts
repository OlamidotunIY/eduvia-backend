import { NotFoundError } from '@modules/shared/domain';

export class PlatformAnnouncementNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`PlatformAnnouncement '${identifier}' was not found.`);
  }
}
