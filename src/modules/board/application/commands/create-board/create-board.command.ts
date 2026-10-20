import { LessonPlanProps } from '../../../domain';

export interface CreateBoardPayload {
  lessonId: string;
  orgId: string;
  plan?: Partial<LessonPlanProps>;
  correlationId?: string;
}

export class CreateBoardCommand {
  constructor(public readonly payload: CreateBoardPayload) {}
}
