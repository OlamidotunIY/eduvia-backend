export interface OrganizationPublicProfileDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  contactEmail: string;
  country: string;
  timezone: string;
  status: string;
  marketplaceListed: boolean;
  acceptingTeachers: boolean;
}
