import { StudentProfileInvariantError } from '../errors/student-profile-invariant-error.error';
import { ParentProfileId } from '../value-objects/parent-profile-id.vo';
import { StudentProfileId } from '../value-objects/student-profile-id.v0';

class StudentProfile {
  public readonly id: StudentProfileId;
  public readonly parentId: ParentProfileId;
  private _dateOfBirth: Date;
  private _countryCode: string;
  private _timezone: string;
  private _gradeLevel: string | null;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: StudentProfileId;
    parentId: ParentProfileId;
    dateOfBirth: Date;
    countryCode: string;
    timezone: string;
    gradeLevel: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.parentId = params.parentId;

    this._dateOfBirth = params.dateOfBirth;
    this._countryCode = params.countryCode;
    this._timezone = params.timezone;
    this._gradeLevel = params.gradeLevel;

    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static create(params: {
    id: StudentProfileId;
    parentId: ParentProfileId;
    dateOfBirth: Date;
    countryCode: string;
    timezone: string;
    gradeLevel?: string;
  }): StudentProfile {
    const countryCode = params.countryCode.trim().toUpperCase();
    const timezone = params.timezone.trim();

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
      dateOfBirth: params.dateOfBirth,
      countryCode,
      timezone,
      gradeLevel: params.gradeLevel?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(params: {
    id: StudentProfileId;
    parentId: ParentProfileId;
    dateOfBirth: Date;
    countryCode: string;
    timezone: string;
    gradeLevel: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): StudentProfile {
    return new StudentProfile(params);
  }

  public updateProfile(params: {
    dateOfBirth?: Date;
    countryCode?: string;
    timezone?: string;
    gradeLevel?: string | null;
  }): void {
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

    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
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

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}

export { StudentProfile };
