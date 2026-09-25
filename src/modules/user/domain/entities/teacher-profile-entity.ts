import { AggregateRoot } from '@modules/shared';
import { TeacherProfileId, UserId } from '../value-objects';

class TeacherProfile extends AggregateRoot<TeacherProfileId> {
  public readonly userId: UserId;

  private _bio: string | null;
  private _phoneNumber: string | null;
  private _avatarUrl: string | null;
  public readonly qualification: string;
  public readonly yearOfExperience: number;
  private _activeOrganizationId: string | null;
  private _subjects: string[];
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: TeacherProfileId;
    userId: UserId;
    activeOrganizationId: string | null;
    bio: string | null;
    phoneNumber: string | null;
    avatarUrl: string | null;
    qualification: string;
    yearOfExperience: number;
    subjects: string[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);
    this.userId = params.userId;
    this._activeOrganizationId = params.activeOrganizationId;
    this._bio = params.bio;
    this._phoneNumber = params.phoneNumber;
    this._avatarUrl = params.avatarUrl;
    this.qualification = params.qualification;
    this.yearOfExperience = params.yearOfExperience;
    this._subjects = [...params.subjects];
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static create(params: {
    userId: UserId;
    bio?: string | null;
    qualification: string;
    yearOfExperience: number;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
    subjects?: string[];
  }): TeacherProfile {
    const now = new Date();

    return new TeacherProfile({
      id: TeacherProfileId.create(),
      userId: params.userId,
      activeOrganizationId: null,
      bio: params.bio ?? null,
      phoneNumber: params.phoneNumber ?? null,
      avatarUrl: params.avatarUrl ?? null,
      qualification: params.qualification,
      yearOfExperience: params.yearOfExperience,
      subjects: params.subjects ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(params: {
    id: TeacherProfileId;
    userId: UserId;
    activeOrganizationId: string | null;
    bio: string | null;
    phoneNumber: string | null;
    avatarUrl: string | null;
    qualification: string;
    yearOfExperience: number;
    subjects: string[];
    createdAt: Date;
    updatedAt: Date;
  }): TeacherProfile {
    return new TeacherProfile(params);
  }

  public get bio(): string | null {
    return this._bio;
  }

  public get phoneNumber(): string | null {
    return this._phoneNumber;
  }

  public get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  public get activeOrganizationId(): string | null {
    return this._activeOrganizationId;
  }

  public get subjects(): string[] {
    return [...this._subjects];
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}

export { TeacherProfile };