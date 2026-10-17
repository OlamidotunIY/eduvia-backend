export interface DeactivateCurriculumNodePayload {
  id: string;
  correlationId?: string;
}

export class DeactivateCurriculumNodeCommand {
  constructor(public readonly payload: DeactivateCurriculumNodePayload) {}
}
