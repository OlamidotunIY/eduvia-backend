import { BadRequestError } from '@modules/shared/domain';

export class AnnouncementAlreadyPublishedError extends BadRequestError {
  constructor(id: string) {
    super(`Platform announcement '${id}' is already published and cannot be modified.`);
  }
}
