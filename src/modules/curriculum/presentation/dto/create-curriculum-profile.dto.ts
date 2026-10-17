export class CreateCurriculumProfileDto {
  name!: string;
  shortCode!: string;
  countryCode!: string;
  description?: string | null;
  authority!: string;
  version?: string | null;
  isActive?: boolean;
}
