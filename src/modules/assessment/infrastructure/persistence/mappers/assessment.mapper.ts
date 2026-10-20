import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Assessment,
  AssessmentId,
  AssessmentStatus,
} from '../../../domain';
import {
  Assessment as PrismaAssessment,
  MarkingItem as PrismaMarkingItem,
} from '@generated/prisma/client';
import { MarkingItemMapper } from './marking-item.mapper';

@Injectable()
export class AssessmentMapper implements IMapper<Assessment, PrismaAssessment> {
  constructor(private readonly itemMapper: MarkingItemMapper) {}

  toDomain(
    record: PrismaAssessment & { markingItems?: PrismaMarkingItem[] },
  ): Assessment {
    const markingItems = record.markingItems
      ? record.markingItems.map((item) => this.itemMapper.toDomain(item))
      : [];

    return Assessment.reconstitute({
      id: AssessmentId.from(record.id),
      orgId: record.orgId,
      lessonId: record.lessonId,
      boardId: record.boardId,
      studentId: record.studentId,
      status: record.status as AssessmentStatus,
      totalMaxMarks: record.totalMaxMarks,
      totalMarksAwarded: record.totalMarksAwarded,
      scorePercent: record.scorePercent,
      autoMarkedCount: record.autoMarkedCount,
      teacherMarkedCount: record.teacherMarkedCount,
      pendingMarkCount: record.pendingMarkCount,
      markingItems,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: Assessment): Omit<PrismaAssessment, 'id'> {
    return {
      orgId: entity.orgId,
      lessonId: entity.lessonId,
      boardId: entity.boardId,
      studentId: entity.studentId,
      status: entity.status as any,
      totalMaxMarks: entity.totalMaxMarks,
      totalMarksAwarded: entity.totalMarksAwarded,
      scorePercent: entity.scorePercent,
      autoMarkedCount: entity.autoMarkedCount,
      teacherMarkedCount: entity.teacherMarkedCount,
      pendingMarkCount: entity.pendingMarkCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
