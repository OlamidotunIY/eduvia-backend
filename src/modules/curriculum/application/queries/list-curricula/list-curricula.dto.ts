export interface CurriculumSummaryDto {
  id: string;
  name: string;
  shortCode: string;
  countryCode: string;
  description: string | null;
  authority: string;
  isActive: boolean;
  version: string | null;
  createdAt: Date;
  updatedAt: Date;
}
