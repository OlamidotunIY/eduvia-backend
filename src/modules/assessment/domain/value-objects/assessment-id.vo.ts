import { BaseEntityId } from '@modules/shared';

export class AssessmentId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): AssessmentId {
    return new AssessmentId(this.nextValue());
  }

  public static from(value: string): AssessmentId {
    return new AssessmentId(value);
  }
}
