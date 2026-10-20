export interface CurriculumNodeDetailDto {
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
  createdAt: Date;
  updatedAt: Date;
  children: {
    id: string;
    name: string;
    code: string | null;
    nodeType: string;
    isLeaf: boolean;
  }[];
}
