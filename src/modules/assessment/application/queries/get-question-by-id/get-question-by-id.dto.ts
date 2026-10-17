import { QuestionOptionProps, QuestionProvenanceProps } from '../../../domain';

export interface QuestionDetailDto {
  id: string;
  ownerType: string;
  ownerId: string | null;
  orgId: string | null;
  type: string;
  stem: string;
  options: QuestionOptionProps[];
  correctOptionKey: string | null;
  markScheme: string | null;
  maxMarks: number;
  difficultyLevel: number;
  subject: string;
  curriculumNodeId: string | null;
  examBoard: string | null;
  yearGroup: string | null;
  tags: string[];
  provenance: QuestionProvenanceProps;
  isPublished: boolean;
  usageCount: number;
  avgScore: number | null;
  correctRate: number | null;
  createdAt: Date;
  updatedAt: Date;
}
