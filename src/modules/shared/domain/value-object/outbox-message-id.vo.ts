import { BaseEntityId } from './base-entity-id.vo';

class OutboxMessageId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): OutboxMessageId {
    return new OutboxMessageId(this.nextValue());
  }

  public static from(value: string): OutboxMessageId {
    return new OutboxMessageId(value);
  }
}

export { OutboxMessageId };
