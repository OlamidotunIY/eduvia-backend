export interface DeactivateCurriculumProfilePayload {
  id: string;
}

export class DeactivateCurriculumProfileCommand {
  constructor(public readonly payload: DeactivateCurriculumProfilePayload) {}
}
