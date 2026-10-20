import { BaseEntityId } from '@modules/shared/domain';

export class AiJobId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): AiJobId {
    return new AiJobId(this.nextValue());
  }

  public static from(value: string): AiJobId {
    return new AiJobId(value);
  }
}
