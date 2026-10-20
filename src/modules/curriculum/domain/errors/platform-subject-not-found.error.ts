import { NotFoundError } from '@modules/shared';

export class PlatformSubjectNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`PlatformSubject with id "${id}" was not found.`);
    this.code = this.constructor.name;
  }
}
