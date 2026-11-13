import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ReceiveTeacherApplicationDTO {
  @ApiPropertyOptional({ description: 'Organization ID (resolved automatically from the route param).' })
  @IsOptional()
  @IsString()
  orgId?: string;

  @ApiPropertyOptional({ description: 'Applicant user ID (resolved automatically from the signed-in user).' })
  @IsOptional()
  @IsString()
  applicantUserId?: string;

  @ApiProperty({ type: [String], description: 'Subject IDs or names the applicant is applying to teach.' })
  @IsArray()
  @IsString({ each: true })
  appliedSubjects!: string[];

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  coverLetter?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  qualifications?: string | null;
}
