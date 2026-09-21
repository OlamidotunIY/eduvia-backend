import { ParentProfileInvariantError } from '../errors';
import { UserId } from '../value-objects';
import { ParentProfileId } from '../value-objects';

class ParentProfile {
  public readonly id: ParentProfileId;
  public readonly userId: UserId;
  private _phoneNumber: string | null;
  private _timezone: string;
  private _avatarUrl: string | null;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: ParentProfileId;
    userId: UserId;
    phoneNumber: string | null;
    timezone: string;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this._phoneNumber = params.phoneNumber;
    this._timezone = params.timezone;
    this._avatarUrl = params.avatarUrl;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static create(params: {
    id: ParentProfileId;
    userId: UserId;
    phoneNumber?: string;
    timezone: string;
    avatarUrl?: string;
  }): ParentProfile {
    const timezone = params.timezone.trim();

    if (!timezone) {
      throw new ParentProfileInvariantError(
        'Timezone cannot be empty',
      );
    }

    const now = new Date();

    return new ParentProfile({
      id: params.id,
      userId: params.userId,
      phoneNumber: params.phoneNumber?.trim() || null,
      timezone,
      avatarUrl: params.avatarUrl?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(params: {
    id: ParentProfileId;
    userId: UserId;
    phoneNumber: string | null;
    timezone: string;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ParentProfile {
    return new ParentProfile(params);
  }

  public updateProfile(params: {
    phoneNumber?: string | null;
    timezone?: string;
    avatarUrl?: string | null;
  }): void {
    if (params.phoneNumber !== undefined) {
      this._phoneNumber = params.phoneNumber?.trim() || null;
    }

    if (params.timezone !== undefined) {
      const timezone = params.timezone.trim();

      if (!timezone) {
        throw new ParentProfileInvariantError(
          'Timezone cannot be empty',
        );
      }

      this._timezone = timezone;
    }

    if (params.avatarUrl !== undefined) {
      this._avatarUrl = params.avatarUrl?.trim() || null;
    }

    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  public get phoneNumber(): string | null {
    return this._phoneNumber;
  }

  public get timezone(): string {
    return this._timezone;
  }

  public get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}

export { ParentProfile };