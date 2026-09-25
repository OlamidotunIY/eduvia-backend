import { OrganizationSubjectId } from '../value-objects';
import { OrganizationSubject } from '../entities/org-subject.entity';

export abstract class IOrganizationSubjectRepository {
  abstract save(subject: OrganizationSubject): Promise<void>;
  abstract findById(id: OrganizationSubjectId): Promise<OrganizationSubject | null>;
  abstract listActiveSubjectNames(orgId: string): Promise<string[]>;
}