import { BaseEntityId } from '@modules/shared';

class OrganizationInvitationId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): OrganizationInvitationId {
    return new OrganizationInvitationId(this.nextValue());
  }

  public static from(value: string): OrganizationInvitationId {
    return new OrganizationInvitationId(value);
  }
}

export { OrganizationInvitationId };