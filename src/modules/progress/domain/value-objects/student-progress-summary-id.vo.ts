import { BaseEntityId } from '@modules/shared/domain';

export class StudentProgressSummaryId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): StudentProgressSummaryId {
    return new StudentProgressSummaryId(this.nextValue());
  }

  public static from(value: string): StudentProgressSummaryId {
    return new StudentProgressSummaryId(value);
  }
}
