export interface UpdateBoardSectionPayload {
  boardId: string;
  sectionId: string;
  content: string;
  correlationId?: string;
}

export class UpdateBoardSectionCommand {
  constructor(public readonly payload: UpdateBoardSectionPayload) {}
}
