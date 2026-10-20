import {
  QuestionOwnerType,
  QuestionType,
  ProvenanceSource,
} from '../../domain';

export class QuestionOptionDto {
  key: string;
  text: string;
  imageUrl?: string | null;
}

export class QuestionProvenanceDto {
  source: ProvenanceSource;
  createdBy: string;
  aiModel?: string | null;
  licenseRef?: string | null;
  paperRef?: string | null;
}

export class CreateQuestionDto {
  ownerType: QuestionOwnerType;
  ownerId?: string | null;
  orgId?: string | null;
  type: QuestionType;
  stem: string;
  options?: QuestionOptionDto[];
  correctOptionKey?: string | null;
  markScheme?: string | null;
  maxMarks: number;
  difficultyLevel: number;
  subject: string;
  curriculumNodeId?: string | null;
  examBoard?: string | null;
  yearGroup?: string | null;
  tags?: string[];
  provenance: QuestionProvenanceDto;
}
