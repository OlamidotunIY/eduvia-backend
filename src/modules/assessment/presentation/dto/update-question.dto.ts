import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionOptionDto } from './create-question.dto';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  stem?: string;

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
  @IsOptional()
  maxMarks?: number;
}
