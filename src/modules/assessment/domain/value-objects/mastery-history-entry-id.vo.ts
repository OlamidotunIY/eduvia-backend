import { BaseEntityId } from '@modules/shared';

export class MasteryHistoryEntryId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): MasteryHistoryEntryId {
    return new MasteryHistoryEntryId(this.nextValue());
  }

  public static from(value: string): MasteryHistoryEntryId {
    return new MasteryHistoryEntryId(value);
  }
}
