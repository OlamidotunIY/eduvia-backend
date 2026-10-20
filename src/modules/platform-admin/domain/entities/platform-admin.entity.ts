import { BusinessRuleViolationError } from '@modules/shared/domain';
import { PlatformAdminId, PlatformAdminRole } from '../value-objects';

export interface PlatformAdminProps {
  id: PlatformAdminId;
  userId: string;
  role: PlatformAdminRole;
  createdAt: Date;
  updatedAt: Date;
}

export class PlatformAdmin {
  private _id: PlatformAdminId;
  private _userId: string;
  private _role: PlatformAdminRole;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: PlatformAdminProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._role = props.role;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: PlatformAdminId;
    userId: string;
    role: PlatformAdminRole;
  }): PlatformAdmin {
    if (!props.userId) {
      throw new BusinessRuleViolationError('User ID is required for PlatformAdmin.');
    }

    const now = new Date();
    return new PlatformAdmin({
      id: props.id ?? PlatformAdminId.create(),
      userId: props.userId,
      role: props.role,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: PlatformAdminProps): PlatformAdmin {
    return new PlatformAdmin(props);
  }

  public get id(): PlatformAdminId {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get role(): PlatformAdminRole {
    return this._role;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public updateRole(newRole: PlatformAdminRole): void {
    this._role = newRole;
    this._updatedAt = new Date();
  }

  public isSuperAdmin(): boolean {
    return this._role === PlatformAdminRole.PlatformSuperAdmin;
  }

  public isCurriculumEditor(): boolean {
    return (
      this._role === PlatformAdminRole.PlatformSuperAdmin ||
      this._role === PlatformAdminRole.CurriculumEditor
    );
  }

  public isSupport(): boolean {
    return (
      this._role === PlatformAdminRole.PlatformSuperAdmin ||
      this._role === PlatformAdminRole.PlatformSupport
    );
  }
}
