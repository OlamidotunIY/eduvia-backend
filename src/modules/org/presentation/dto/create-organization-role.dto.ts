import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationPermission } from '../../domain';

export class CreateOrganizationRoleDTO {
  @ApiProperty({ description: 'Role name', example: 'Teaching Assistant' })
  name!: string;

  @ApiPropertyOptional({ description: 'Role description', example: 'Support teachers with class activities.' })
  description?: string;

  @ApiProperty({ enum: OrganizationPermission, isArray: true, description: 'Role permissions' })
  permissions!: OrganizationPermission[];
}
