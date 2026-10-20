export interface UnlockBoardPayload {
  boardId: string;
  unlockedBy: string;
  correlationId?: string;
}

export class UnlockBoardCommand {
  constructor(public readonly payload: UnlockBoardPayload) {}
}
