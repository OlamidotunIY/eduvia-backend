import { BaseEntityId } from '@modules/shared';

export class SubjectCurriculumMappingId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): SubjectCurriculumMappingId {
    return new SubjectCurriculumMappingId(this.nextValue());
  }

  public static from(value: string): SubjectCurriculumMappingId {
    return new SubjectCurriculumMappingId(value);
  }
}
