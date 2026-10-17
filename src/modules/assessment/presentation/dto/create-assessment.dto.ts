import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../../domain';

export class CreateAssessmentItemDto {
  @IsString()
  @IsNotEmpty()
  boardQuestionId: string;

  @IsString()
  @IsNotEmpty()
  studentResponseId: string;

  @IsEnum(QuestionType)
  questionType: QuestionType;

  @IsInt()
  @Min(0)
  maxMarks: number;

  @IsBoolean()
  @IsOptional()
  autoMarked?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  marksAwarded?: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}

export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  boardId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ValidateNested({ each: true })
  @Type(() => CreateAssessmentItemDto)
  items: CreateAssessmentItemDto[];
}
