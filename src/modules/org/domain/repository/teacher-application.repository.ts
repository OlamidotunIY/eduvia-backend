import { BaseRepository } from '@modules/shared';
import { TeacherApplication } from '../entities';
import { OrganizationId, TeacherApplicationId } from '../value-objects';

export abstract class ITeacherApplicationRepository extends BaseRepository<
  TeacherApplication,
  TeacherApplicationId
> {
  public abstract findByOrganizationId(
    orgId: OrganizationId | string,
  ): Promise<TeacherApplication[]>;

  public abstract findByApplicantUserId(
    applicantUserId: string,
  ): Promise<TeacherApplication | null>;
}
