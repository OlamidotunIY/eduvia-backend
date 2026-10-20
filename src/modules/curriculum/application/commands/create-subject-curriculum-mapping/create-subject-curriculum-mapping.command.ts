export interface CreateSubjectCurriculumMappingPayload {
  platformSubjectId: string;
  curriculumId: string;
  subjectNodeId: string;
}

export class CreateSubjectCurriculumMappingCommand {
  constructor(public readonly payload: CreateSubjectCurriculumMappingPayload) {}
}
