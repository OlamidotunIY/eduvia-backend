import { BaseEntityId } from '@modules/shared';

class OrganizationSubjectId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): OrganizationSubjectId {
    return new OrganizationSubjectId(this.nextValue());
  }

  public static from(value: string): OrganizationSubjectId {
    return new OrganizationSubjectId(value);
  }
}

export { OrganizationSubjectId };