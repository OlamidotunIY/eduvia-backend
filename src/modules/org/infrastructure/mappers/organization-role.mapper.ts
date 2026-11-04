import { Injectable } from '@nestjs/common';
import { IMapper } from '@modules/shared';
import { OrganizationRole } from '../../domain/model';
import {
  OrganizationId,
  OrganizationPermission,
  OrganizationRoleId,
  OrganizationRoleKey,
} from '../../domain/value-objects';

type OrganizationRoleRecord = {
  id: string;
  orgId: string;
  key: string | null;
  name: string;
  description: string | null;
  permissions: unknown;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class OrganizationRoleMapper implements IMapper<OrganizationRole, OrganizationRoleRecord> {
  toDomain(record: OrganizationRoleRecord): OrganizationRole {
    return OrganizationRole.reconstitute({
      id: OrganizationRoleId.from(record.id),
      orgId: OrganizationId.from(record.orgId),
      key: record.key as OrganizationRoleKey | null,
      name: record.name,
      description: record.description,
      permissions: parsePermissions(record.permissions),
      isSystem: record.isSystem,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: OrganizationRole): Omit<OrganizationRoleRecord, 'id'> {
    return {
      orgId: entity.orgId.value,
      key: entity.key,
      name: entity.name,
      description: entity.description,
      permissions: entity.permissions,
      isSystem: entity.isSystem,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

function parsePermissions(value: unknown): OrganizationPermission[] {
  if (!Array.isArray(value)) return [];
  const knownPermissions = new Set(Object.values(OrganizationPermission));
  return value.filter((permission): permission is OrganizationPermission =>
    typeof permission === 'string' && knownPermissions.has(permission as OrganizationPermission),
  );
}
