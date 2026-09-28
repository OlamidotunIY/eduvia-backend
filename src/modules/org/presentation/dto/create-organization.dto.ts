export class CreateOrganizationDTO{
    ownerId: string;
    name: string;
    slug: string;
    contactEmail: string;
    country: string;
    timezone: string;
    logoUrl?: string | null;
    websiteUrl?: string | null;
}