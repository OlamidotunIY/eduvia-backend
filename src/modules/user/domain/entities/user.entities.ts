import { AggregateRoot } from '../../../shared';
import { BusinessRuleViolationError } from '../../../shared/domain/errors/business-rule-violation.error';
import { ConflictError } from '../../../shared/domain/errors/conflict.error';
import {
  EmailRequired,
  NameRequiredError,
  UserAlreadySuspendedError,
  UserInvariantError,
} from '../errors';
import { UserCreatedEvent } from '../events/user-created-event';
import { UserUpdatedEvent } from '../events/user-updated-event';
import { UserId } from '../value-objects/user-id.vo';
import { UserStatus } from '../value-objects/user-status.v0';
import { UserType } from '../value-objects/user-type.v0';

class User extends AggregateRoot<UserId> {
  constructor(
    id: UserId,
    public readonly userType: UserType,
    private _firstName: string,
    private _lastName: string,
    private _email: string,
    private _username: string | null,
    private _image: string | null,
    private _emailVerified: boolean,
    private _twoFactorEnabled: boolean | null,
    private _status: UserStatus,
    private _timezone: string,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  public isTeacher(): boolean {
    return this.userType === UserType.TEACHER;
  }

  public isAdmin(): boolean {
    return this.userType === UserType.ADMIN;
  }

  public isParent(): boolean {
    return this.userType === UserType.PARENT;
  }

  public isStudent(): boolean {
    return this.userType === UserType.STUDENT;
  }

  public isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  public isSuspended(): boolean {
    return this._status === UserStatus.SUSPENDED;
  }

  public get firstName(): string {
    return this._firstName;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public get email(): string {
    return this._email;
  }

  public get status(): UserStatus {
    return this._status;
  }

  public get username(): string | null {
    return this._username;
  }

  public get image(): string | null {
    return this._image;
  }

  public get emailVerified(): boolean {
    return this._emailVerified;
  }

  public get twoFactorEnabled(): boolean | null {
    return this._twoFactorEnabled;
  }

  public get timezone(): string {
    return this._timezone;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(params: {
    id: UserId;
    userType: UserType;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    timezone?: string;
    correlationId: string;
  }): User {
    const email = params.email.trim().toLowerCase();
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();

    if (!email) {
      throw new EmailRequired();
    }

    if (!firstName || !lastName) {
      throw new NameRequiredError();
    }

    const now = new Date();

    const user = new User(
      params.id,
      params.userType,
      firstName,
      lastName,
      email,
      null,
      null,
      false,
      false,
      UserStatus.ACTIVE,
      params.timezone?.trim() || 'UTC',
      now,
      now,
    );

    user.addDomainEvent(
      new UserCreatedEvent(
        user.getId(),
        new UserCreatedEvent.Payload(
          user.getId(),
          user.userType,
          user.email,
          params.passwordHash,
        ),
        params.correlationId,
      ),
    );

    return user;
  }

  public updateProfile(params: {
    firstName?: string;
    lastName?: string;
    email?: string;
    correlationId: string;
  }): void {
    const firstName = params.firstName?.trim();
    const lastName = params.lastName?.trim();
    const email = params.email?.trim().toLowerCase();

    if (firstName !== undefined && !firstName) {
      throw new UserInvariantError('firstName cannot be empty');
    }
    if (lastName !== undefined && !lastName) {
      throw new UserInvariantError('lastName cannot be empty');
    }
    if (email !== undefined && !email) {
      throw new UserInvariantError('email cannot be empty');
    }

    if (firstName !== undefined) {
      this._firstName = firstName;
    }
    if (lastName !== undefined) {
      this._lastName = lastName;
    }
    if (email !== undefined) {
      this._email = email;
    }
    this._updatedAt = new Date();

    this.addDomainEvent(
      new UserUpdatedEvent(
        this.getId(),
        new UserUpdatedEvent.Payload(this.getId(), this.userType, this.email),
        params.correlationId,
      ),
    );
  }

  public suspend(): void {
    if (this.isSuspended()) {
      throw new UserAlreadySuspendedError();
    }

    this._status = UserStatus.SUSPENDED;
    this._updatedAt = new Date();
  }

  public activate(): void {
    if (this.isActive()) {
      return;
    }

    this._status = UserStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  public markEmailVerified(): void {
    if (this._emailVerified) {
      return;
    }

    this._emailVerified = true;
    this._updatedAt = new Date();
  }

  public static reconstitute(params: {
    id: UserId;
    userType: UserType;
    firstName: string;
    lastName: string;
    email: string;
    username: string | null;
    image: string | null;
    emailVerified: boolean;
    twoFactorEnabled: boolean | null;
    status: UserStatus;
    timezone: string;
    updatedAt: Date;
    createdAt: Date;
  }): User {
    return new User(
      params.id,
      params.userType,
      params.firstName,
      params.lastName,
      params.email,
      params.username,
      params.image,
      params.emailVerified,
      params.twoFactorEnabled,
      params.status,
      params.timezone,
      params.createdAt,
      params.updatedAt,
    );
  }
}

export { User };
