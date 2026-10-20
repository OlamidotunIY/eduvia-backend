import { NodeType } from '../../../domain';

export interface CreateCurriculumNodePayload {
  curriculumId: string;
  parentNodeId?: string | null;
  nodeType: NodeType;
  name: string;
  code?: string | null;
  description?: string | null;
  gradeLevel?: string | null;
  isActive?: boolean;
  correlationId?: string;
}

export class CreateCurriculumNodeCommand {
  constructor(public readonly payload: CreateCurriculumNodePayload) {}
}
