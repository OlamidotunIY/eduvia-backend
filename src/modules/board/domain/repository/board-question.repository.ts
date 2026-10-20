import { BaseRepository } from '@modules/shared';
import { BoardQuestionId } from '../value-objects';
import { BoardQuestion } from '../entities/board-question.entity';

export abstract class IBoardQuestionRepository extends BaseRepository<BoardQuestion, BoardQuestionId> {
  public abstract findByBoardId(boardId: string): Promise<BoardQuestion[]>;
  public abstract findByBoardAndQuestion(boardId: string, questionId: string): Promise<BoardQuestion | null>;
}
