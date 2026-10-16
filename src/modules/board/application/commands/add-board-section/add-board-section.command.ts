import { SectionType } from '../../../domain';

export interface AddBoardSectionPayload {
  boardId: string;
  type: SectionType;
  content: string;
  position?: number;
  createdBy: string;
  isTeacherOnly?: boolean;
  correlationId?: string;
}

export class AddBoardSectionCommand {
  constructor(public readonly payload: AddBoardSectionPayload) {}
}
