export interface CreateCurriculumProfilePayload {
  name: string;
  shortCode: string;
  countryCode: string;
  jurisdictionCode: string;
  description?: string | null;
  authority: string;
  version?: string | null;
  sourceUrl?: string | null;
  isActive?: boolean;
  correlationId?: string;
}

export class CreateCurriculumProfileCommand {
  constructor(public readonly payload: CreateCurriculumProfilePayload) {}
}
