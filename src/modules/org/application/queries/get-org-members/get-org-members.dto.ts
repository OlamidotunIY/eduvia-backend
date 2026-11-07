export interface OrganizationMemberUserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
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
  user?: OrganizationMemberUserDTO | null;
}

