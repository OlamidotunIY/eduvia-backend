import {
  QuestionOwnerType,
  QuestionType,
  ProvenanceSource,
} from '../../../domain';

export interface CreateQuestionPayload {
  ownerType: QuestionOwnerType;
  ownerId?: string | null;
  orgId?: string | null;
  type: QuestionType;
  stem: string;
  options?: Array<{ key: string; text: string; imageUrl?: string | null }>;
  correctOptionKey?: string | null;
  markScheme?: string | null;
  maxMarks: number;
  difficultyLevel: number;
  subject: string;
  curriculumNodeId?: string | null;
  examBoard?: string | null;
  yearGroup?: string | null;
  tags?: string[];
  provenance: {
    source: ProvenanceSource;
    createdBy: string;
    aiModel?: string | null;
    licenseRef?: string | null;
    paperRef?: string | null;
  };
  isPublished?: boolean;
  correlationId?: string;
}

export class CreateQuestionCommand {
  constructor(public readonly payload: CreateQuestionPayload) {}
}
