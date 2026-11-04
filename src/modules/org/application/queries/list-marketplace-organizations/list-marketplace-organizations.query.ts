import { Query } from '@nestjs/cqrs';
import { MarketplaceOrganizationDTO } from './list-marketplace-organizations.payload';

export class ListMarketplaceOrganizationsQuery extends Query<
  MarketplaceOrganizationDTO[]
> {}
