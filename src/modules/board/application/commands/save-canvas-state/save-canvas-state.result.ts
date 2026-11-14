import { BoardCanvasState } from '../../../domain';

export interface SaveCanvasStateResult {
  id: string;
  canvasState: BoardCanvasState | null;
}
