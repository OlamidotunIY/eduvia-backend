import { BaseEntityId } from '@modules/shared';

class AvailabilitySlotId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): AvailabilitySlotId {
    return new AvailabilitySlotId(this.nextValue());
  }

  public static from(value: string): AvailabilitySlotId {
    return new AvailabilitySlotId(value);
  }
}

export { AvailabilitySlotId };
