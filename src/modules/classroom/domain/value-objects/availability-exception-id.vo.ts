import { BaseEntityId } from '@modules/shared';

class AvailabilityExceptionId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): AvailabilityExceptionId {
    return new AvailabilityExceptionId(this.nextValue());
  }

  public static from(value: string): AvailabilityExceptionId {
    return new AvailabilityExceptionId(value);
  }
}

export { AvailabilityExceptionId };
