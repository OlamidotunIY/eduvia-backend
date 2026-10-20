export interface CreateCurriculumProfilePayload {
  name: string;
  shortCode: string;
  countryCode: string;
  description?: string | null;
  authority: string;
  version?: string | null;
  isActive?: boolean;
  correlationId?: string;
}

export class CreateCurriculumProfileCommand {
  constructor(public readonly payload: CreateCurriculumProfilePayload) {}
}
