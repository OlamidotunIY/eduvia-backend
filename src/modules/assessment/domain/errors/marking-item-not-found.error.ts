import { NotFoundError } from '@modules/shared';

export class MarkingItemNotFoundError extends NotFoundError {
  constructor(markingItemId: string) {
    super(`Marking item with id "${markingItemId}" was not found.`);
    this.code = this.constructor.name;
  }
}
