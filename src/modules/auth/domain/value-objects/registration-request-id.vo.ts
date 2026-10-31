import { BaseEntityId } from '@modules/shared';

class RegistrationRequestId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): RegistrationRequestId {
    return new RegistrationRequestId(this.nextValue());
  }

  public static from(value: string): RegistrationRequestId {
    return new RegistrationRequestId(value);
  }
}

export { RegistrationRequestId };
