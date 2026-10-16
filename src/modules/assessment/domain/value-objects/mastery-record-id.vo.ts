import { BaseEntityId } from '@modules/shared';

export class MasteryRecordId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): MasteryRecordId {
    return new MasteryRecordId(this.nextValue());
  }

  public static from(value: string): MasteryRecordId {
    return new MasteryRecordId(value);
  }
}
