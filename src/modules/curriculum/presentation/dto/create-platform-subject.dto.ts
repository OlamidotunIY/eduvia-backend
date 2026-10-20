export class CreatePlatformSubjectDto {
  name!: string;
  shortCode!: string;
  description?: string | null;
  isActive?: boolean;
}
