import { NodeType } from '../../domain';

export class CreateCurriculumNodeDto {
  parentNodeId?: string | null;
  nodeType!: NodeType;
  name!: string;
  code?: string | null;
  description?: string | null;
  gradeLevel?: string | null;
  isActive?: boolean;
}
