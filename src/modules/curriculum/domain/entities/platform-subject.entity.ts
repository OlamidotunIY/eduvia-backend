import { PlatformSubjectId } from '../value-objects';

export interface PlatformSubjectProps {
  id: PlatformSubjectId;
  name: string;
  shortCode: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export class PlatformSubject {
  public readonly id: PlatformSubjectId;
  private _name: string;
  private _shortCode: string;
  private _description: string | null;
  private _isActive: boolean;
  private _createdAt: Date;

  private constructor(props: PlatformSubjectProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('PlatformSubject name cannot be empty.');
    }
    if (!props.shortCode || props.shortCode.trim().length === 0) {
      throw new Error('PlatformSubject shortCode cannot be empty.');
    }
    this.id = props.id;
    this._name = props.name.trim();
    this._shortCode = props.shortCode.trim().toUpperCase();
    this._description = props.description ?? null;
    this._isActive = props.isActive;
    this._createdAt = new Date(props.createdAt);
  }

  public static create(props: {
    id?: PlatformSubjectId;
    name: string;
    shortCode: string;
    description?: string | null;
    isActive?: boolean;
  }): PlatformSubject {
    return new PlatformSubject({
      id: props.id ?? PlatformSubjectId.create(),
      name: props.name,
      shortCode: props.shortCode,
      description: props.description ?? null,
      isActive: props.isActive ?? true,
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: PlatformSubjectProps): PlatformSubject {
    return new PlatformSubject(props);
  }

  public get name(): string {
    return this._name;
  }

  public get shortCode(): string {
    return this._shortCode;
  }

  public get description(): string | null {
    return this._description;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public update(name?: string, description?: string | null): void {
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        throw new Error('PlatformSubject name cannot be empty.');
      }
      this._name = name.trim();
    }
    if (description !== undefined) {
      this._description = description ?? null;
    }
  }

  public activate(): void {
    this._isActive = true;
  }

  public deactivate(): void {
    this._isActive = false;
  }
}
