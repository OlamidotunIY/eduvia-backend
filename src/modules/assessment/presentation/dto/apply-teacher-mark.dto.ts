import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ApplyTeacherMarkDto {
  @IsInt()
  @Min(0)
  marksAwarded: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}
