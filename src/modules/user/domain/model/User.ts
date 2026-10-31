import { AggregateRoot } from '../../../shared';
import {
  EmailRequired,
  NameRequiredError,
  UserAlreadySuspendedError,
} from '../errors';
import { UserRegistrationCreatedEvent } from '../events/user-registration-created-event';
import { UserUpdatedEvent } from '../events/user-updated-event';
import { OnboardingStatus } from '../value-objects/onboarding-status.vo';
import { UserId } from '../value-objects/user-id.vo';
import { UserStatus } from '../value-objects/user-status.v0';
import { UserType } from '../value-objects/user-type.v0';

export class User extends AggregateRoot<UserId> {
  private constructor(
    id: UserId,
    private _userType: UserType,
    private _firstName: string,
    private _lastName: string,
    private _email: string,
    private _username: string | null,
    private _image: string | null,
    private _emailVerified: boolean,
    private _twoFactorEnabled: boolean | null,
    private _status: UserStatus,
    private _onboardingStatus: OnboardingStatus,
    private _timezone: string,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  public isTeacher(): boolean {
    return this._userType === UserType.TEACHER;
  }

  public isAdmin(): boolean {
    return this._userType === UserType.ADMIN;
  }

  public isParent(): boolean {
    return this._userType === UserType.PARENT;
  }

  public isStudent(): boolean {
    return this._userType === UserType.STUDENT;
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

  public get userType(): UserType {
    return this._userType;
  }

  public get onboardingStatus(): OnboardingStatus {
    return this._onboardingStatus;
  }

  public isOnboardingComplete(): boolean {
    return this._onboardingStatus === OnboardingStatus.COMPLETED;
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
    image?: string | null;
    emailVerified?: boolean;
    timezone?: string;
    onboardingStatus?: OnboardingStatus;
  }): User {
    const email = params.email.trim().toLowerCase();
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();
    if (!email) throw new EmailRequired();
    if (!firstName || !lastName) throw new NameRequiredError();
    const now = new Date();
    return new User(
      params.id,
      params.userType,
      firstName,
      lastName,
      email,
      null,
      params.image?.trim() || null,
      params.emailVerified ?? false,
      false,
      UserStatus.ACTIVE,
      params.onboardingStatus ?? OnboardingStatus.COMPLETED,
      params.timezone?.trim() || 'UTC',
      now,
      now,
    );
  }

  public static createPendingRegistration(params: {
    id: UserId;
    registrationRequestId: string;
    email: string;
    firstName: string;
    lastName: string;
    image?: string | null;
    emailVerified: boolean;
    timezone?: string;
    correlationId: string;
  }): User {
    const email = params.email.trim().toLowerCase();
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();
    if (!email) throw new EmailRequired();
    if (!firstName || !lastName) throw new NameRequiredError();

    const now = new Date();
    const user = new User(
      params.id,
      UserType.PENDING,
      firstName,
      lastName,
      email,
      null,
      params.image?.trim() || null,
      params.emailVerified,
      false,
      UserStatus.ACTIVE,
      OnboardingStatus.PENDING,
      params.timezone?.trim() || 'UTC',
      now,
      now,
    );
    user.addDomainEvent(
      new UserRegistrationCreatedEvent(
        user.getId(),
        new UserRegistrationCreatedEvent.Payload(
          params.registrationRequestId,
          user.getId(),
          user.email,
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

    if (firstName !== undefined) {
      if (!firstName) {
        throw new NameRequiredError();
      }
      this._firstName = firstName;
    }
    if (lastName !== undefined) {
      if (!lastName) {
        throw new NameRequiredError();
      }
      this._lastName = lastName;
    }
    if (email !== undefined) {
      if (!email) {
        throw new EmailRequired();
      }
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

  public completeOnboarding(params: {
    userType: UserType;
    firstName: string;
    lastName: string;
    timezone?: string;
    correlationId: string;
  }): void {
    if (params.userType !== UserType.PARENT && params.userType !== UserType.TEACHER) {
      throw new Error('Only parent and teacher roles can complete self-service onboarding');
    }
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();
    if (!firstName || !lastName) throw new NameRequiredError();
    this._userType = params.userType;
    this._firstName = firstName;
    this._lastName = lastName;
    this._timezone = params.timezone?.trim() || this._timezone;
    this._onboardingStatus = OnboardingStatus.COMPLETED;
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
    onboardingStatus: OnboardingStatus;
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
      params.onboardingStatus,
      params.timezone,
      params.createdAt,
      params.updatedAt,
    );
  }
}
