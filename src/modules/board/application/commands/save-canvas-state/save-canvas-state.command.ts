import { BoardCanvasState } from '../../../domain';

export interface SaveCanvasStatePayload {
  boardId: string;
  canvasState: BoardCanvasState;
}

export class SaveCanvasStateCommand {
  constructor(public readonly payload: SaveCanvasStatePayload) {}
}
