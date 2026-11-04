import { AggregateRoot } from '@modules/shared';
import { OrganizationInvariantError } from '../errors';
import {
  OrganizationId,
  OrganizationPermission,
  OrganizationRoleId,
  OrganizationRoleKey,
} from '../value-objects';

class OrganizationAccessRole extends AggregateRoot<OrganizationRoleId> {
  public readonly orgId: OrganizationId;
  public readonly key: OrganizationRoleKey | null;
  private _name: string;
  private _description: string | null;
  private _permissions: OrganizationPermission[];
  public readonly isSystem: boolean;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: OrganizationRoleId;
    orgId: OrganizationId;
    key: OrganizationRoleKey | null;
    name: string;
    description: string | null;
    permissions: OrganizationPermission[];
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);
    this.orgId = params.orgId;
    this.key = params.key;
    this._name = params.name;
    this._description = params.description;
    this._permissions = params.permissions;
    this.isSystem = params.isSystem;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static create(params: {
    id: OrganizationRoleId;
    orgId: OrganizationId;
    key: OrganizationRoleKey | null;
    name: string;
    description: string | null;
    permissions: OrganizationPermission[];
    isSystem: boolean;
    correlationId: string;
  }): OrganizationAccessRole {
    const now = new Date();
    const entity = new OrganizationAccessRole({
      ...params,
      createdAt: now,
      updatedAt: now,
    });

    return entity;
  }

  public static reconstitute(params: {
    id: OrganizationRoleId;
    orgId: OrganizationId;
    key: OrganizationRoleKey | null;
    name: string;
    description: string | null;
    permissions: OrganizationPermission[];
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): OrganizationAccessRole {
    return new OrganizationAccessRole(params);
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string | null {
    return this._description;
  }

  public get permissions(): OrganizationPermission[] {
    return [...this._permissions];
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public rename(name: string, description: string | null): void {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new OrganizationInvariantError('Organization role name is required');
    }
    this._name = normalizedName;
    this._description = description?.trim() || null;
    this.touch();
  }

  public updatePermissions(permissions: OrganizationPermission[]): void {
    if (permissions.length !== new Set(permissions).size) {
      throw new OrganizationInvariantError('Organization role permissions must be unique');
    }
    this._permissions = [...permissions];
    this.touch();
  }

  public hasPermission(permission: OrganizationPermission): boolean {
    return this._permissions.includes(permission);
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}

export { OrganizationAccessRole };
