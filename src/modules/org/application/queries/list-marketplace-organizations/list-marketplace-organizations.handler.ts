import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListMarketplaceOrganizationsQuery } from './list-marketplace-organizations.query';
import { MarketplaceOrganizationDTO } from './list-marketplace-organizations.payload';
import { IOrganizationRepository } from '../../../domain/repository';

@QueryHandler(ListMarketplaceOrganizationsQuery)
export class ListMarketplaceOrganizationsHandler
  implements IQueryHandler<ListMarketplaceOrganizationsQuery, MarketplaceOrganizationDTO[]>
{
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(): Promise<MarketplaceOrganizationDTO[]> {
    const organizations = await this.organizationRepository.findMarketplaceListings();

    return organizations.map((organization) => ({
      id: organization.getId(),
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      logoUrl: organization.logoUrl,
      websiteUrl: organization.websiteUrl,
      country: organization.country,
      timezone: organization.timezone,
      acceptingTeachers: organization.acceptingTeachers,
    }));
  }
}
