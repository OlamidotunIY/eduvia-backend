import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  MarkingItem,
  MarkingItemId,
  MarkingStatus,
  QuestionType,
} from '../../../domain';
import { MarkingItem as PrismaMarkingItem } from '@generated/prisma/client';

@Injectable()
export class MarkingItemMapper implements IMapper<MarkingItem, PrismaMarkingItem> {
  toDomain(record: PrismaMarkingItem): MarkingItem {
    return MarkingItem.reconstitute({
      id: MarkingItemId.from(record.id),
      assessmentId: record.assessmentId,
      boardQuestionId: record.boardQuestionId,
      studentResponseId: record.studentResponseId,
      questionType: record.questionType as QuestionType,
      maxMarks: record.maxMarks,
      autoMarked: record.autoMarked,
      marksAwarded: record.marksAwarded,
      feedback: record.feedback,
      markedBy: record.markedBy,
      markedAt: record.markedAt,
      status: record.status as MarkingStatus,
    });
  }

  toPersistence(entity: MarkingItem): Omit<PrismaMarkingItem, 'id'> {
    return {
      assessmentId: entity.assessmentId,
      boardQuestionId: entity.boardQuestionId,
      studentResponseId: entity.studentResponseId,
      questionType: entity.questionType as any,
      maxMarks: entity.maxMarks,
      autoMarked: entity.autoMarked,
      marksAwarded: entity.marksAwarded,
      feedback: entity.feedback,
      markedBy: entity.markedBy,
      markedAt: entity.markedAt,
      status: entity.status as any,
    };
  }
}
