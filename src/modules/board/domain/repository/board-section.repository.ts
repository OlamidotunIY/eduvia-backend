import { BaseRepository } from '@modules/shared';
import { BoardSectionId } from '../value-objects';
import { BoardSection } from '../entities/board-section.entity';

export abstract class IBoardSectionRepository extends BaseRepository<BoardSection, BoardSectionId> {
  public abstract findByBoardId(boardId: string): Promise<BoardSection[]>;
  public abstract deleteByBoardId(boardId: string): Promise<void>;
}
