import { OrganizationId, OrganizationSubjectId } from '../value-objects';
import { OrganizationSubject } from '../entities/org-subject.entity';
import { BaseRepository } from '@modules/shared';

export abstract class IOrganizationSubjectRepository extends BaseRepository<
  OrganizationSubject,
  OrganizationSubjectId
> {

  public abstract findByOrganizationId(
    orgId: OrganizationId | string,
  ): Promise<OrganizationSubject | null>;


  public abstract findActiveSubjectsByOrganizationId(
    orgId: OrganizationId | string,
  ): Promise<OrganizationSubject[]>;
}
