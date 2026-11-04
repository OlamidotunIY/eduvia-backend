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
}
