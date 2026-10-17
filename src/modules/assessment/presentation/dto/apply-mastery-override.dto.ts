import { IsNumber, Max, Min } from 'class-validator';

export class ApplyMasteryOverrideDto {
  @IsNumber()
  @Min(0)
  @Max(1.0)
  score: number;
}
