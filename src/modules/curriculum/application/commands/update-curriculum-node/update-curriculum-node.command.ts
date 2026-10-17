export interface UpdateCurriculumNodePayload {
  id: string;
  name?: string;
  code?: string | null;
  description?: string | null;
  gradeLevel?: string | null;
  correlationId?: string;
}

export class UpdateCurriculumNodeCommand {
  constructor(public readonly payload: UpdateCurriculumNodePayload) {}
}
