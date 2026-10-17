import { BaseEntityId } from '@modules/shared/domain';

export class PlatformAnnouncementId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): PlatformAnnouncementId {
    return new PlatformAnnouncementId(this.nextValue());
  }

  public static from(value: string): PlatformAnnouncementId {
    return new PlatformAnnouncementId(value);
  }
}
