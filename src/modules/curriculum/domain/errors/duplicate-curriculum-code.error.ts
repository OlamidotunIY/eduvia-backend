import { ConflictError } from '@modules/shared';

export class DuplicateCurriculumCodeError extends ConflictError {
  constructor(code: string) {
    super(`Curriculum with code "${code}" already exists.`);
    this.code = this.constructor.name;
  }
}
