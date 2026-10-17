export interface PlatformSubjectDto {
  id: string;
  name: string;
  shortCode: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}
