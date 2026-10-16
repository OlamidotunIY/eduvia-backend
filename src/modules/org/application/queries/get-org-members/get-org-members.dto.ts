export interface OrganizationMemberDTO {
  id: string;
  orgId: string;
  userId: string;
  role: string;
  subjects: string[];
  status: string;
  joinedAt: Date;
  updatedAt: Date;
}
