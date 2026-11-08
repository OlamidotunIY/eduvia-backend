import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationPermission } from '../../domain';

export class OrganizationPermissionResponseDTO {
  @ApiProperty({ enum: OrganizationPermission, description: 'Permission key', example: 'classrooms:read' })
  id!: OrganizationPermission;

  @ApiProperty({ description: 'Human-readable permission name', example: 'View classrooms' })
  name!: string;

  @ApiProperty({ description: 'Permission category group', example: 'Classroom Management' })
  category!: string;

  @ApiPropertyOptional({ description: 'Detailed permission description', example: 'View classrooms and schedules' })
  description?: string;
}
