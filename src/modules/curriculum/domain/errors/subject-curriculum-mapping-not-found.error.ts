import { NotFoundError } from '@modules/shared';

export class SubjectCurriculumMappingNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`SubjectCurriculumMapping with id "${id}" was not found.`);
    this.code = this.constructor.name;
  }
}
