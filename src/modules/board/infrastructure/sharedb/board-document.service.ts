import { Injectable } from '@nestjs/common';
import {
  ShareDBBackendService,
  BoardSnapshot,
  OtOp,
} from './sharedb-backend.service';

@Injectable()
export class BoardDocumentService {
  constructor(private readonly shareDBBackend: ShareDBBackendService) {}

  async createBoardDocument(
    boardId: string,
    initialData: Partial<BoardSnapshot>,
  ): Promise<void> {
    this.shareDBBackend.getOrCreateDocument(boardId, initialData);
  }

  async applyServerOp(boardId: string, op: OtOp[]): Promise<void> {
    this.shareDBBackend.applyServerOp(boardId, op);
  }

  async switchMode(boardId: string, newMode: string): Promise<void> {
    await this.applyServerOp(boardId, [{ p: ['mode'], oi: newMode }]);
  }

  async setLocked(boardId: string, isLocked: boolean): Promise<void> {
    await this.applyServerOp(boardId, [{ p: ['isLocked'], oi: isLocked }]);
  }

  async getBoardSnapshot(boardId: string): Promise<BoardSnapshot | null> {
    return this.shareDBBackend.getDocumentSnapshot(boardId);
  }
}
