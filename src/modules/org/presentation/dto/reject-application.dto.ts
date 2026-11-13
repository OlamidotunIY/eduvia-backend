import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectApplicationDTO {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Optional reason shared with the applicant for declining the application.',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
