export interface CurriculumTreeNodeDto {
  id: string;
  curriculumId: string;
  parentNodeId: string | null;
  nodeType: string;
  name: string;
  code: string | null;
  description: string | null;
  gradeLevel: string | null;
  depth: number;
  path: string;
  isLeaf: boolean;
  isActive: boolean;
  children: CurriculumTreeNodeDto[];
}
