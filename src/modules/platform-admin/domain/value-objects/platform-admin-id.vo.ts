import { BaseEntityId } from '@modules/shared/domain';

export class PlatformAdminId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): PlatformAdminId {
    return new PlatformAdminId(this.nextValue());
  }

  public static from(value: string): PlatformAdminId {
    return new PlatformAdminId(value);
  }
}
