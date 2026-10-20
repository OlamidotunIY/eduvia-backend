import { BaseEntityId } from '@modules/shared';

class BoardSectionId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): BoardSectionId {
    return new BoardSectionId(this.nextValue());
  }

  public static from(value: string): BoardSectionId {
    return new BoardSectionId(value);
  }
}

export { BoardSectionId };
