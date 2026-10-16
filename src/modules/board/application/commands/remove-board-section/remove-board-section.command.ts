export interface RemoveBoardSectionPayload {
  boardId: string;
  sectionId: string;
  correlationId?: string;
}

export class RemoveBoardSectionCommand {
  constructor(public readonly payload: RemoveBoardSectionPayload) {}
}
