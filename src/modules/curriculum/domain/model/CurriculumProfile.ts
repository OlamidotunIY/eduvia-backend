import { AggregateRoot } from '@modules/shared';
import { CurriculumProfileId } from '../value-objects';
import { CurriculumCreatedEvent } from '../events';

export interface CurriculumProfileProps {
  id: CurriculumProfileId;
  name: string;
  shortCode: string;
  countryCode: string;
  description?: string | null;
  authority: string;
  isActive: boolean;
  version?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CurriculumProfile extends AggregateRoot<CurriculumProfileId> {
  private _name: string;
  private _shortCode: string;
  private _countryCode: string;
  private _description: string | null;
  private _authority: string;
  private _isActive: boolean;
  private _version: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: CurriculumProfileProps) {
    super(props.id);
    this._name = props.name;
    this._shortCode = props.shortCode;
    this._countryCode = props.countryCode;
    this._description = props.description ?? null;
    this._authority = props.authority;
    this._isActive = props.isActive;
    this._version = props.version ?? null;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(
    props: {
      id?: CurriculumProfileId;
      name: string;
      shortCode: string;
      countryCode: string;
      description?: string | null;
      authority: string;
      isActive?: boolean;
      version?: string | null;
    },
    correlationId = 'system',
  ): CurriculumProfile {
    const profileId = props.id ?? CurriculumProfileId.create();
    const now = new Date();

    const profile = new CurriculumProfile({
      id: profileId,
      name: props.name.trim(),
      shortCode: props.shortCode.trim().toUpperCase(),
      countryCode: props.countryCode.trim().toUpperCase(),
      description: props.description ?? null,
      authority: props.authority.trim(),
      isActive: props.isActive ?? true,
      version: props.version ?? null,
      createdAt: now,
      updatedAt: now,
    });

    profile.addDomainEvent(
      new CurriculumCreatedEvent(
        profileId.value,
        new CurriculumCreatedEvent.Payload(
          profileId.value,
          profile.name,
          profile.countryCode,
        ),
        correlationId,
      ),
    );

    return profile;
  }

  public static reconstitute(props: CurriculumProfileProps): CurriculumProfile {
    return new CurriculumProfile(props);
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  public get name(): string {
    return this._name;
  }

  public get shortCode(): string {
    return this._shortCode;
  }

  public get countryCode(): string {
    return this._countryCode;
  }

  public get description(): string | null {
    return this._description;
  }

  public get authority(): string {
    return this._authority;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get version(): string | null {
    return this._version;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public activate(): void {
    this._isActive = true;
    this.touch();
  }

  public deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  public update(params: {
    name?: string;
    description?: string | null;
    authority?: string;
    version?: string | null;
  }): void {
    if (params.name !== undefined) {
      this._name = params.name.trim();
    }
    if (params.description !== undefined) {
      this._description = params.description ?? null;
    }
    if (params.authority !== undefined) {
      this._authority = params.authority.trim();
    }
    if (params.version !== undefined) {
      this._version = params.version ?? null;
    }
    this.touch();
  }
}
