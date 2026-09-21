import { StudentProfileInvariantError } from '../errors/student-profile-invariant-error.error';
import { StudentStatus } from '../value-objects';
import { ParentProfileId } from '../value-objects/parent-profile-id.vo';
import { StudentProfileId } from '../value-objects/student-profile-id.v0';

class StudentProfile {
  public readonly id: StudentProfileId;
  public readonly parentId: ParentProfileId;
  private _firstName: string;
  private _lastName: string;
  private _dateOfBirth: Date;
  private _countryCode: string;
  private _timezone: string;
  private _gradeLevel: string | null;
  private _avatarUrl: string | null;
  private _status: StudentStatus;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: StudentProfileId;
    parentId: ParentProfileId;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    countryCode: string;
    timezone: string;
    gradeLevel: string | null;
    avatarUrl: string | null;
    status: StudentStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.parentId = params.parentId;

    this._firstName = params.firstName;
    this._lastName = params.lastName;
    this._dateOfBirth = params.dateOfBirth;
    this._countryCode = params.countryCode;
    this._timezone = params.timezone;
    this._gradeLevel = params.gradeLevel;
    this._avatarUrl = params.avatarUrl;
    this._status = params.status;

    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static create(params: {
    id: StudentProfileId;
    parentId: ParentProfileId;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    countryCode: string;
    timezone: string;
    gradeLevel?: string;
    avatarUrl?: string;
  }): StudentProfile {
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();
    const countryCode = params.countryCode.trim().toUpperCase();
    const timezone = params.timezone.trim();

    if (!firstName) {
      throw new StudentProfileInvariantError(
        'First name cannot be empty',
      );
    }

    if (!lastName) {
      throw new StudentProfileInvariantError(
        'Last name cannot be empty',
      );
    }

    if (!countryCode) {
      throw new StudentProfileInvariantError(
        'Country code cannot be empty',
      );
    }

    if (!timezone) {
      throw new StudentProfileInvariantError(
        'Timezone cannot be empty',
      );
    }

    const now = new Date();

    return new StudentProfile({
      id: params.id,
      parentId: params.parentId,
      firstName,
      lastName,
      dateOfBirth: params.dateOfBirth,
      countryCode,
      timezone,
      gradeLevel: params.gradeLevel?.trim() || null,
      avatarUrl: params.avatarUrl?.trim() || null,
      status: StudentStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(params: {
    id: StudentProfileId;
    parentId: ParentProfileId;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    countryCode: string;
    timezone: string;
    gradeLevel: string | null;
    avatarUrl: string | null;
    status: StudentStatus;
    createdAt: Date;
    updatedAt: Date;
  }): StudentProfile {
    return new StudentProfile(params);
  }

  public updateProfile(params: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    countryCode?: string;
    timezone?: string;
    gradeLevel?: string | null;
    avatarUrl?: string | null;
  }): void {
    if (params.firstName !== undefined) {
      const firstName = params.firstName.trim();

      if (!firstName) {
        throw new StudentProfileInvariantError(
          'First name cannot be empty',
        );
      }

      this._firstName = firstName;
    }

    if (params.lastName !== undefined) {
      const lastName = params.lastName.trim();

      if (!lastName) {
        throw new StudentProfileInvariantError(
          'Last name cannot be empty',
        );
      }

      this._lastName = lastName;
    }

    if (params.dateOfBirth !== undefined) {
      this._dateOfBirth = params.dateOfBirth;
    }

    if (params.countryCode !== undefined) {
      const countryCode = params.countryCode.trim().toUpperCase();

      if (!countryCode) {
        throw new StudentProfileInvariantError(
          'Country code cannot be empty',
        );
      }

      this._countryCode = countryCode;
    }

    if (params.timezone !== undefined) {
      const timezone = params.timezone.trim();

      if (!timezone) {
        throw new StudentProfileInvariantError(
          'Timezone cannot be empty',
        );
      }

      this._timezone = timezone;
    }

    if (params.gradeLevel !== undefined) {
      this._gradeLevel = params.gradeLevel?.trim() || null;
    }

    if (params.avatarUrl !== undefined) {
      this._avatarUrl = params.avatarUrl?.trim() || null;
    }

    this.touch();
  }

  public deactivate(): void {
    if (this.isInactive()) {
      return;
    }

    this._status = StudentStatus.INACTIVE;

    this.touch();
  }

  public activate(): void {
    if (this.isActive()) {
      return;
    }

    this._status = StudentStatus.ACTIVE;

    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  public get firstName(): string {
    return this._firstName;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public get dateOfBirth(): Date {
    return this._dateOfBirth;
  }

  public get countryCode(): string {
    return this._countryCode;
  }

  public get timezone(): string {
    return this._timezone;
  }

  public get gradeLevel(): string | null {
    return this._gradeLevel;
  }

  public get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  public get status(): StudentStatus {
    return this._status;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public isActive(): boolean {
    return this._status === StudentStatus.ACTIVE;
  }

  public isInactive(): boolean {
    return this._status === StudentStatus.INACTIVE;
  }
}

export { StudentProfile };