import { BaseEntityId } from '../../../shared/domain/value-object/base-entity-id.vo';

class VerificationId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): VerificationId {
    return new VerificationId(this.nextValue());
  }

  public static from(value: string): VerificationId {
    return new VerificationId(value);
  }
}

export { VerificationId };
