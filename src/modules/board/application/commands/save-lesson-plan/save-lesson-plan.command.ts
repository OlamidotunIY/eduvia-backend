export interface SaveLessonPlanPayload {
  boardId: string;
  learningObjectives?: string[];
  topicsCovered?: string[];
  teachingNotes?: string | null;
  homeworkDescription?: string | null;
}

export class SaveLessonPlanCommand {
  constructor(public readonly payload: SaveLessonPlanPayload) {}
}
