export interface GetCurrentUserBootstrapPayload {
  userId: string;
}

export interface CurrentUserBootstrapDTO {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    image: string | null;
    userType: string;
    onboardingStatus: string;
    emailVerified: boolean;
    timezone: string;
  };
  activeOrganization: {
    id: string; name: string; slug: string; role: string; memberCount: number;
  } | null;
  organizations: Array<{
    id: string; name: string; slug: string; role: string; status: string; memberCount: number;
  }>;
}
