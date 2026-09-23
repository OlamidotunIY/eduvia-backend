import { BaseEntityId } from "@modules/shared";


class OrganizationId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): OrganizationId {
    return new OrganizationId(this.nextValue());
  }

  public static from(value: string): OrganizationId {
    return new OrganizationId(value);
  }
}

export { OrganizationId };
