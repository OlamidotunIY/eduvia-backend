import { NotFoundError } from '@modules/shared';

export class CurriculumNodeNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`CurriculumNode with id "${id}" was not found.`);
    this.code = this.constructor.name;
  }
}
