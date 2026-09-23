import { AggregateRoot } from '@modules/shared';
import { UserId } from '../value-objects';
import { ParentProfileId } from '../value-objects';

class ParentProfile extends AggregateRoot<ParentProfileId> {
  public readonly userId: UserId;
  private _phoneNumber: string | null;
  public readonly createdAt: Date;
  private _updatedAt: Date;
  private constructor(params: {
    id: ParentProfileId;
    userId: UserId;
    phoneNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);
    this.userId = params.userId;
    this._phoneNumber = params.phoneNumber;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }
  public static create(params: {
    id: ParentProfileId;
    userId: UserId;
    phoneNumber?: string;
  }): ParentProfile {
    const now = new Date();

    return new ParentProfile({
      id: params.id,
      userId: params.userId,
      phoneNumber: params.phoneNumber?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(params: {
    id: ParentProfileId;
    userId: UserId;
    phoneNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ParentProfile {
    return new ParentProfile(params);
  }

  public updateProfile(params: {
    phoneNumber?: string | null;
  }): void {
    if (params.phoneNumber !== undefined) {
      this._phoneNumber = params.phoneNumber?.trim() || null;
    }

    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  public get phoneNumber(): string | null {
    return this._phoneNumber;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}

export { ParentProfile };
