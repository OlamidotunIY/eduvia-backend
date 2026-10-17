import { NotFoundError } from '@modules/shared';

export class CurriculumProfileNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`CurriculumProfile with id "${id}" was not found.`);
    this.code = this.constructor.name;
  }
}
