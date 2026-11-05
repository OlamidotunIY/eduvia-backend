export class ListClassroomLearnerCandidatesQuery {
  constructor(
    public readonly classroomId: string,
    public readonly orgId: string,
  ) {}
}
