export interface LockBoardPayload {
  boardId: string;
  lockedBy: string;
  correlationId?: string;
}

export class LockBoardCommand {
  constructor(public readonly payload: LockBoardPayload) {}
}
