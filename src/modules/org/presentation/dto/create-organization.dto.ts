export class CreateOrganizationDTO {
  name!: string;
  slug!: string;
  contactEmail!: string;
  country!: string;
  timezone!: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
}
