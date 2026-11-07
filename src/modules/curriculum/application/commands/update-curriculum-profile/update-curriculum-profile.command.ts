export interface UpdateCurriculumProfilePayload {
  id: string;
  name?: string;
  description?: string | null;
  authority?: string;
  version?: string | null;
  sourceUrl?: string | null;
}

export class UpdateCurriculumProfileCommand {
  constructor(public readonly payload: UpdateCurriculumProfilePayload) {}
}
