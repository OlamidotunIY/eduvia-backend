import { BaseEntityId } from '@modules/shared/domain';

export class DeviceTokenId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): DeviceTokenId {
    return new DeviceTokenId(this.nextValue());
  }

  public static from(value: string): DeviceTokenId {
    return new DeviceTokenId(value);
  }
}
