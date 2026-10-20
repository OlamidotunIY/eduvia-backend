export interface CompleteLessonPlanPayload {
  boardId: string;
  correlationId?: string;
}

export class CompleteLessonPlanCommand {
  constructor(public readonly payload: CompleteLessonPlanPayload) {}
}
