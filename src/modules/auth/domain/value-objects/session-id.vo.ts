import { BaseEntityId } from '../../../shared/domain/value-object/base-entity-id.vo';

class SessionId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): SessionId {
    return new SessionId(this.nextValue());
  }

  public static from(value: string): SessionId {
    return new SessionId(value);
  }
}

export { SessionId };
