import { BaseEntityId } from '@modules/shared';

export class MarkingItemId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): MarkingItemId {
    return new MarkingItemId(this.nextValue());
  }

  public static from(value: string): MarkingItemId {
    return new MarkingItemId(value);
  }
}
