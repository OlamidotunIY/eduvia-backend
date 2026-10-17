import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionOwnerType, QuestionType } from '../../domain';

export class SearchQuestionsDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  curriculumNodeId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  difficultyLevel?: number;

  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @IsEnum(QuestionOwnerType)
  @IsOptional()
  ownerType?: QuestionOwnerType;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsOptional()
  orgId?: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  skip?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  take?: number;
}
