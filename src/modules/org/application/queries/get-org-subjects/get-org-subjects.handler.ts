import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationSubjectsQuery } from './get-org-subjects.query';
import { OrganizationSubjectDTO } from './get-org-subjects.dto';
import { IOrganizationSubjectRepository } from '../../../domain/repository';

@QueryHandler(GetOrganizationSubjectsQuery)
export class GetOrganizationSubjectsHandler
  implements IQueryHandler<GetOrganizationSubjectsQuery, OrganizationSubjectDTO[]>
{
  constructor(
    private readonly orgSubjectRepository: IOrganizationSubjectRepository,
  ) {}

  async execute(
    query: GetOrganizationSubjectsQuery,
  ): Promise<OrganizationSubjectDTO[]> {
    const subjects = query.activeOnly
      ? await this.orgSubjectRepository.findActiveSubjectsByOrganizationId(
          query.orgId,
        )
      : await this.orgSubjectRepository.findByOrganizationId(
          query.orgId,
        );

    return subjects.map((s) => ({
      id: s.getId(),
      orgId: s.orgId.toString(),
      name: s.name,
      platformSubjectId: s.platformSubjectId,
      description: s.description,
      isActive: s.isActive,
      createdAt: s.createdAt,
    }));
  }
}
