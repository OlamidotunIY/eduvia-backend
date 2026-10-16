import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  BoardQuestion,
  BoardQuestionId,
  QuestionMode,
} from '../../../domain';
import { BoardQuestion as PrismaBoardQuestion } from '@generated/prisma/client';

@Injectable()
export class BoardQuestionMapper implements IMapper<BoardQuestion, PrismaBoardQuestion> {
  toDomain(record: PrismaBoardQuestion): BoardQuestion {
    return BoardQuestion.reconstitute({
      id: BoardQuestionId.from(record.id),
      boardId: record.boardId,
      questionId: record.questionId,
      position: record.position,
      mode: record.mode as QuestionMode,
      assignedAt: record.assignedAt,
      dueAt: record.dueAt,
      showOptions: record.showOptions,
      maxMarks: record.maxMarks,
    });
  }

  toPersistence(entity: BoardQuestion): Omit<PrismaBoardQuestion, 'id'> {
    return {
      boardId: entity.boardId,
      questionId: entity.questionId,
      position: entity.position,
      mode: entity.mode as any,
      assignedAt: entity.assignedAt,
      dueAt: entity.dueAt ?? null,
      showOptions: entity.showOptions,
      maxMarks: entity.maxMarks,
    };
  }
}
