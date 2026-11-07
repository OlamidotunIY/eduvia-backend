export interface OrganizationMemberUserDTO {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  image: string | null;
  avatarUrl?: string | null;
  status: string;
}

export interface OrganizationMemberDTO {
  id: string;
  orgId: string;
  userId: string;
  role: string;
  roleId: string | null;
  subjects: string[];
  status: string;
  joinedAt: Date;
  updatedAt: Date;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  user?: OrganizationMemberUserDTO | null;
}

