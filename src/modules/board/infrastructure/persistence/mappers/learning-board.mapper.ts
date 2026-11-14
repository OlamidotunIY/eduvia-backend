import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  BoardCanvasState,
  LearningBoard,
  LearningBoardId,
  BoardMode,
  LessonPlan,
} from '../../../domain';
import {
  LearningBoard as PrismaLearningBoard,
  Prisma,
} from '@generated/prisma/client';

function parseCanvasState(raw: unknown): BoardCanvasState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const obj = raw as Record<string, unknown>;
  return {
    strokes: Array.isArray(obj.strokes)
      ? (obj.strokes as Array<Record<string, unknown>>)
      : [],
    surfaceStyle:
      typeof obj.surfaceStyle === 'string' ? obj.surfaceStyle : undefined,
    boardBgColor:
      typeof obj.boardBgColor === 'string' ? obj.boardBgColor : undefined,
    notebookWidthMode:
      typeof obj.notebookWidthMode === 'string'
        ? obj.notebookWidthMode
        : undefined,
    notebookPages:
      typeof obj.notebookPages === 'number' ? obj.notebookPages : undefined,
  };
}

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
      canvasState: parseCanvasState(record.canvasState),
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
      canvasState: entity.canvasState
        ? (entity.canvasState as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
