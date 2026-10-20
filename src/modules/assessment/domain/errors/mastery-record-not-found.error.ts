import { NotFoundError } from '@modules/shared';

export class MasteryRecordNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`Mastery record "${identifier}" was not found.`);
    this.code = this.constructor.name;
  }
}
