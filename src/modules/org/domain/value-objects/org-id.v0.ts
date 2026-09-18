import { BaseEntityId } from '../../../shared/domain/value-object/base-entity-id.vo';

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
