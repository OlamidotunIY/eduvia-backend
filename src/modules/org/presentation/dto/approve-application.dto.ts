import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { OrganizationRole } from '../../domain';

export class ApproveApplicationDTO {
  @ApiPropertyOptional({
    type: [String],
    description: 'Subjects approved for the applicant (defaults to their applied subjects).',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  approvedSubjects?: string[];

  @ApiPropertyOptional({
    enum: OrganizationRole,
    description: 'Organization role granted upon approval (defaults to Teacher).',
  })
  @IsOptional()
  @IsEnum(OrganizationRole)
  role?: OrganizationRole;

  @ApiPropertyOptional({
    type: String,
    description: 'Specific organization access role ID to assign upon approval.',
  })
  @IsOptional()
  @IsString()
  roleId?: string;
}
