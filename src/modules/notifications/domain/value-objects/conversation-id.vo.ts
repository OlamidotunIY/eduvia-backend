import { BaseEntityId } from '@modules/shared/domain';

export class ConversationId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): ConversationId {
    return new ConversationId(this.nextValue());
  }

  public static from(value: string): ConversationId {
    return new ConversationId(value);
  }
}
