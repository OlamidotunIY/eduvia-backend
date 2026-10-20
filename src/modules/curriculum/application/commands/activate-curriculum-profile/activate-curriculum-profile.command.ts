export interface ActivateCurriculumProfilePayload {
  id: string;
}

export class ActivateCurriculumProfileCommand {
  constructor(public readonly payload: ActivateCurriculumProfilePayload) {}
}
