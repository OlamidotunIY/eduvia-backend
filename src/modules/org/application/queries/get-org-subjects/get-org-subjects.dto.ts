export interface OrganizationSubjectDTO {
  id: string;
  orgId: string;
  name: string;
  platformSubjectId: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}
