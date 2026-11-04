import { ListMarketplaceOrganizationsHandler } from './list-marketplace-organizations.handler';
import { ListMarketplaceOrganizationsQuery } from './list-marketplace-organizations.query';

describe('ListMarketplaceOrganizationsHandler', () => {
  it('returns marketplace-safe details for active listed organizations', async () => {
    const repository = {
      findMarketplaceListings: jest.fn().mockResolvedValue([
        {
          getId: () => 'organization-1',
          name: 'Eduvia Academy',
          slug: 'eduvia-academy',
          description: 'International science tutoring.',
          logoUrl: 'https://cdn.eduvia.name.ng/logo.png',
          websiteUrl: 'https://academy.eduvia.name.ng',
          country: 'NG',
          timezone: 'Africa/Lagos',
          acceptingTeachers: true,
        },
      ]),
    };
    const handler = new ListMarketplaceOrganizationsHandler(repository as never);

    await expect(handler.execute(new ListMarketplaceOrganizationsQuery())).resolves.toEqual([
      {
        id: 'organization-1',
        name: 'Eduvia Academy',
        slug: 'eduvia-academy',
        description: 'International science tutoring.',
        logoUrl: 'https://cdn.eduvia.name.ng/logo.png',
        websiteUrl: 'https://academy.eduvia.name.ng',
        country: 'NG',
        timezone: 'Africa/Lagos',
        acceptingTeachers: true,
      },
    ]);
  });
});
