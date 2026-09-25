import { BaseEntityId } from '@modules/shared';

class OrganizationMembershipId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): OrganizationMembershipId {
    return new OrganizationMembershipId(this.nextValue());
  }

  public static from(value: string): OrganizationMembershipId {
    return new OrganizationMembershipId(value);
  }
}

export { OrganizationMembershipId };