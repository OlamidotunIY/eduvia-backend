import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  QuestionOwnerType,
  QuestionType,
  ProvenanceSource,
} from '../../domain';

export class QuestionOptionDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class QuestionProvenanceDto {
  @IsEnum(ProvenanceSource)
  source: ProvenanceSource;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsString()
  @IsOptional()
  aiModel?: string;

  @IsString()
  @IsOptional()
  licenseRef?: string;

  @IsString()
  @IsOptional()
  paperRef?: string;
}

export class CreateQuestionDto {
  @IsEnum(QuestionOwnerType)
  ownerType: QuestionOwnerType;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsOptional()
  orgId?: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  stem: string;

  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  @IsOptional()
  options?: QuestionOptionDto[];

  @IsString()
  @IsOptional()
  correctOptionKey?: string;

  @IsString()
  @IsOptional()
  markScheme?: string;

  @IsInt()
  @Min(1)
  maxMarks: number;

  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel: number;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsOptional()
  curriculumNodeId?: string;

  @IsString()
  @IsOptional()
  examBoard?: string;

  @IsString()
  @IsOptional()
  yearGroup?: string;

  @IsOptional()
  tags?: string[];

  @ValidateNested()
  @Type(() => QuestionProvenanceDto)
  provenance: QuestionProvenanceDto;
}
