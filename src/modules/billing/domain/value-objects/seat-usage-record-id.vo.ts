import { BaseEntityId } from '@modules/shared/domain';

export class SeatUsageRecordId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): SeatUsageRecordId {
    return new SeatUsageRecordId(this.nextValue());
  }

  public static from(value: string): SeatUsageRecordId {
    return new SeatUsageRecordId(value);
  }
}
