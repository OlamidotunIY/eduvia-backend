import { BoardMode } from '../../../domain';

export interface SwitchBoardModePayload {
  boardId: string;
  mode: BoardMode;
  changedBy: string;
  lessonStatus?: string;
  correlationId?: string;
}

export class SwitchBoardModeCommand {
  constructor(public readonly payload: SwitchBoardModePayload) {}
}
