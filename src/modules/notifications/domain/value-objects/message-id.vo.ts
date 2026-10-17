import { BaseEntityId } from '@modules/shared/domain';

export class MessageId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): MessageId {
    return new MessageId(this.nextValue());
  }

  public static from(value: string): MessageId {
    return new MessageId(value);
  }
}
