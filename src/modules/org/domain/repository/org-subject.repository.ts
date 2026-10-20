import { OrganizationId, OrganizationSubjectId } from '../value-objects';
import { OrganizationSubject } from '../model/OrganizationSubject';
import { BaseRepository } from '@modules/shared';

export abstract class IOrganizationSubjectRepository extends BaseRepository<
  OrganizationSubject,
  OrganizationSubjectId
> {
  public abstract findByOrganizationId(
    orgId: OrganizationId | string,
  ): Promise<OrganizationSubject[]>;

  public abstract findActiveSubjectsByOrganizationId(
    orgId: OrganizationId | string,
  ): Promise<OrganizationSubject[]>;
}
