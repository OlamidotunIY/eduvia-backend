import { BaseEntityId } from '@modules/shared';

class OrganizationRoleId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): OrganizationRoleId {
    return new OrganizationRoleId(this.nextValue());
  }

  public static from(value: string): OrganizationRoleId {
    return new OrganizationRoleId(value);
  }
}

export { OrganizationRoleId };
