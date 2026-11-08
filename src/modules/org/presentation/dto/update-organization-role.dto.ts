import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationPermission } from '../../domain';

export class UpdateOrganizationRoleDTO {
  @ApiProperty({ description: 'Role name', example: 'Teacher' })
  name!: string;

  @ApiPropertyOptional({ description: 'Role description', example: 'Create and manage lessons, assessments and student progress.' })
  description?: string;

  @ApiProperty({ enum: OrganizationPermission, isArray: true, description: 'Role permissions' })
  permissions!: OrganizationPermission[];
}
