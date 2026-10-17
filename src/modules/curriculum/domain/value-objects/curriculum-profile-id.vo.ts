import { BaseEntityId } from '@modules/shared';

export class CurriculumProfileId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): CurriculumProfileId {
    return new CurriculumProfileId(this.nextValue());
  }

  public static from(value: string): CurriculumProfileId {
    return new CurriculumProfileId(value);
  }
}
