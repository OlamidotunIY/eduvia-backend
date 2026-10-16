import { Query } from '@nestjs/cqrs';
import { OrganizationPublicProfileDTO } from './get-org-by-slug.dto';

export class GetOrganizationBySlugQuery extends Query<OrganizationPublicProfileDTO | null> {
  constructor(public readonly slug: string) {
    super();
  }
}
