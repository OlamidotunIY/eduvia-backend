import { BaseEntityId } from '@modules/shared/domain';

export class NotificationId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): NotificationId {
    return new NotificationId(this.nextValue());
  }

  public static from(value: string): NotificationId {
    return new NotificationId(value);
  }
}
