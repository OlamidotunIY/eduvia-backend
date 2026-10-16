import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  LearningBoard,
  LearningBoardId,
  BoardMode,
  LessonPlan,
} from '../../../domain';
import { LearningBoard as PrismaLearningBoard } from '@generated/prisma/client';

@Injectable()
export class LearningBoardMapper implements IMapper<LearningBoard, PrismaLearningBoard> {
  toDomain(record: PrismaLearningBoard): LearningBoard {
    const plan = LessonPlan.create({
      learningObjectives: Array.isArray(record.planObjectives)
        ? (record.planObjectives as string[])
        : [],
      topicsCovered: Array.isArray(record.planTopicNodeIds)
        ? (record.planTopicNodeIds as string[])
        : [],
      teachingNotes: record.planNotes,
      homeworkDescription: record.planHomework,
      isComplete: record.planComplete,
      completedAt: record.planCompletedAt,
    });

    return LearningBoard.reconstitute({
      id: LearningBoardId.from(record.id),
      lessonId: record.lessonId,
      orgId: record.orgId,
      mode: record.mode as BoardMode,
      plan,
      isLocked: record.isLocked,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: LearningBoard): Omit<PrismaLearningBoard, 'id'> {
    return {
      lessonId: entity.lessonId,
      orgId: entity.orgId,
      mode: entity.mode as any,
      isLocked: entity.isLocked,
      planObjectives: entity.plan.learningObjectives,
      planTopicNodeIds: entity.plan.topicsCovered,
      planNotes: entity.plan.teachingNotes ?? null,
      planHomework: entity.plan.homeworkDescription ?? null,
      planComplete: entity.plan.isComplete,
      planCompletedAt: entity.plan.completedAt ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
