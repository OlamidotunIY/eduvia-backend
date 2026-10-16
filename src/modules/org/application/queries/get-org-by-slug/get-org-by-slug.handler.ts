import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationBySlugQuery } from './get-org-by-slug.query';
import { OrganizationPublicProfileDTO } from './get-org-by-slug.dto';
import { IOrganizationRepository } from '../../../domain/repository';

@QueryHandler(GetOrganizationBySlugQuery)
export class GetOrganizationBySlugHandler
  implements IQueryHandler<GetOrganizationBySlugQuery, OrganizationPublicProfileDTO | null>
{
  constructor(private readonly orgRepository: IOrganizationRepository) {}

  async execute(
    query: GetOrganizationBySlugQuery,
  ): Promise<OrganizationPublicProfileDTO | null> {
    const org = await this.orgRepository.findBySlug(query.slug);
    if (!org) return null;

    return {
      id: org.getId(),
      name: org.name,
      slug: org.slug,
      description: org.description,
      logoUrl: org.logoUrl,
      websiteUrl: org.websiteUrl,
      contactEmail: org.contactEmail,
      country: org.country,
      timezone: org.timezone,
      status: org.status,
      marketplaceListed: org.marketplaceListed,
      acceptingTeachers: org.acceptingTeachers,
    };
  }
}
