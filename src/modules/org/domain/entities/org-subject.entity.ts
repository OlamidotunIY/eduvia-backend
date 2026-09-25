import { OrganizationSubjectId } from "../value-objects";

class OrganizationSubject {
  public readonly id: OrganizationSubjectId;
  public readonly orgId: string;
  private _name: string;
  private _platformSubjectId: string | null;
  private _description: string | null;
  private _isActive: boolean;
  public readonly createdAt: Date;

  private constructor(params: {
    id: OrganizationSubjectId;
    orgId: string;
    name: string;
    platformSubjectId: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.orgId = params.orgId;
    this._name = params.name;
    this._platformSubjectId = params.platformSubjectId;
    this._description = params.description;
    this._isActive = params.isActive;
    this.createdAt = params.createdAt;
  }

  public static create(params: {
    orgId: string;
    name: string;
    platformSubjectId?: string | null;
    description?: string | null;
  }): OrganizationSubject {
    return new OrganizationSubject({
      id: OrganizationSubjectId.create(),
      orgId: params.orgId,
      name: params.name,
      platformSubjectId: params.platformSubjectId ?? null,
      description: params.description ?? null,
      isActive: true,
      createdAt: new Date(),
    });
  }

  public static reconstitute(params: {
    id: OrganizationSubjectId;
    orgId: string;
    name: string;
    platformSubjectId: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
  }): OrganizationSubject {
    return new OrganizationSubject(params);
  }

  public rename(name: string): void {
    this._name = name;
  }

  public updateDescription(description: string | null): void {
    this._description = description;
  }

  public linkToPlatformSubject(platformSubjectId: string | null): void {
    this._platformSubjectId = platformSubjectId;
  }

  public activate(): void {
    this._isActive = true;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string | null {
    return this._description;
  }

  public get platformSubjectId(): string | null {
    return this._platformSubjectId;
  }

  public get isActive(): boolean {
    return this._isActive;
  }
}

export { OrganizationSubject };