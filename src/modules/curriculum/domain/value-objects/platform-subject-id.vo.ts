import { BaseEntityId } from '@modules/shared';

export class PlatformSubjectId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): PlatformSubjectId {
    return new PlatformSubjectId(this.nextValue());
  }

  public static from(value: string): PlatformSubjectId {
    return new PlatformSubjectId(value);
  }
}
