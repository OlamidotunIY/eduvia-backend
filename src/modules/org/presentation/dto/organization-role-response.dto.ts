import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationPermission, OrganizationRoleKey } from '../../domain';

export class OrganizationRoleResponseDTO {
  @ApiProperty({ description: 'Role identifier', example: '01a1aa4e-ef05-7365-838a-a82c268ca25a' })
  id!: string;

  @ApiProperty({ description: 'Organization identifier', example: '01a19d71-3839-7736-b312-dbc221b5eeb6' })
  orgId!: string;

  @ApiPropertyOptional({ enum: OrganizationRoleKey, nullable: true, example: OrganizationRoleKey.TEACHER })
  key!: OrganizationRoleKey | null;

  @ApiProperty({ description: 'Role display name', example: 'Teacher' })
  name!: string;

  @ApiPropertyOptional({ description: 'Role description', nullable: true, example: 'Create and manage lessons...' })
  description!: string | null;

  @ApiProperty({ enum: OrganizationPermission, isArray: true, description: 'Role permissions' })
  permissions!: OrganizationPermission[];

  @ApiProperty({ description: 'Whether the role is a system-defined role', example: true })
  isSystem!: boolean;

  @ApiProperty({ description: 'Number of active members assigned to this role', example: 6 })
  membersCount!: number;

  @ApiProperty({ description: 'Role creation date', example: '2026-11-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Role last updated date', example: '2026-11-01T00:00:00.000Z' })
  updatedAt!: Date;
}
