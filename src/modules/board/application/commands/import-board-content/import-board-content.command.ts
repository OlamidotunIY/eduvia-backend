export interface ImportBoardContentPayload {
  targetBoardId: string;
  sourceBoardId: string;
  importedBy: string;
  correlationId?: string;
}

export class ImportBoardContentCommand {
  constructor(public readonly payload: ImportBoardContentPayload) {}
}
