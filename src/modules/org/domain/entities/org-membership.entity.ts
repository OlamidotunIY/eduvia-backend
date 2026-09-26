import { OrganizationInvariantError } from "../errors";
import { MembershipStatus,  OrganizationRole } from "../value-objects";


class OrganizationMembership {
  public readonly orgId: string;
  public readonly userId: string;
  private _role: OrganizationRole;
  private _subjects: string[];
  private _status: MembershipStatus;
  public readonly joinedAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    orgId: string;
    userId: string;
    role: OrganizationRole;
    subjects: string[];
    status: MembershipStatus;
    joinedAt: Date;
    updatedAt: Date;
   
  }) {
    this.orgId = params.orgId;
    this.userId = params.userId;
    this._role = params.role;
    this._subjects = params.subjects;
    this._status = params.status;
    this.joinedAt = params.joinedAt;
    this._updatedAt = params.updatedAt;
    
  }

  public static create(params: {
    orgId: string;
    userId: string;
    role: OrganizationRole;
    subjects?: string[];
  }): OrganizationMembership {
    const now = new Date();
    return new OrganizationMembership({
      orgId: params.orgId,
      userId: params.userId,
      role: params.role,
      subjects: params.subjects ?? [],
      status: MembershipStatus.ACTIVE,
      joinedAt: now,
      updatedAt: now,
      
    });
  }

  public static reconstitute(params: {
    orgId: string;
    userId: string;
    role: OrganizationRole;
    subjects: string[];
    status: MembershipStatus;
    joinedAt: Date;
    updatedAt: Date;
  }): OrganizationMembership {
    return new OrganizationMembership(params);
  }

  public changeRole(newRole: OrganizationRole): void {
    if (this._status !== MembershipStatus.ACTIVE) {
      throw new OrganizationInvariantError("User is not active");
    }
    this._role = newRole;
    this._updatedAt = new Date();
  }

  public updateSubjects(subjects: string[]): void {
    this._subjects = subjects;
    this._updatedAt = new Date();
  }

  public suspend(): void {
    if (this._status === MembershipStatus.SUSPENDED) {
      throw new Error("");
    }
    if (this._status === MembershipStatus.INACTIVE) {
      throw new Error("");
    }
    this._status = MembershipStatus.SUSPENDED;
    this._updatedAt = new Date();
  }


  public get role(): OrganizationRole {
    return this._role;
  }

  public get subjects(): string[] {
    return this._subjects;
  }

  public get status(): MembershipStatus {
    return this._status;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }


  public isActive(): boolean {
    return this._status === MembershipStatus.ACTIVE;
  }

  public isAdmin(): boolean {
    return this._role === OrganizationRole.OWNER || this._role === OrganizationRole.ADMIN;
  }
}

export { OrganizationMembership };