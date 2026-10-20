import { BaseEntityId } from '@modules/shared';

export class CurriculumNodeId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): CurriculumNodeId {
    return new CurriculumNodeId(this.nextValue());
  }

  public static from(value: string): CurriculumNodeId {
    return new CurriculumNodeId(value);
  }
}
