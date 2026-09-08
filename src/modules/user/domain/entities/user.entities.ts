import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { BusinessRuleViolationError } from '../../../shared/domain/errors/business-rule-violation-error';
import { ConflictError } from '../../../shared/domain/errors/conflict-error';
import { DomainErrorCode } from '../../../shared/domain/errors/domain-error-code';
import { InvalidDomainArgumentError } from '../../../shared/domain/errors/invalid-domain-error-argument';
import { UserCreatedEvent } from '../events/user-created-event';
import { UserUpdatedEvent } from '../events/user-updated-event';
import { UserStatus } from '../value-objects/user-status.v0';
import { UserType } from '../value-objects/user-type.v0';

class User extends AggregateRoot<number> {
  constructor(
    id: number,
    public readonly userType: UserType,
    private _firstName: string,
    private _lastName: string,
    private _email: string,
    private _status: UserStatus,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {
    super(id);
  }

  public getId(): number {
    return this.id;
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

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(params: {
    id: number;
    userType: UserType;
    email: string;
    firstName: string;
    lastName: string;
    correlationId: string;
  }): User {
    const email = params.email.trim().toLowerCase();
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();

    if (!email) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
        `Invalid email: ${email}`
      );
    }

    if (!firstName || !lastName) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
        'firstName and lastName are required'
      );
    }

    const now = new Date();

    const user = new User(
      params.id,
      params.userType,
      firstName,
      lastName,
      email,
      UserStatus.ACTIVE,
      now,
      now,
    );

    user.addDomainEvent(
      new UserCreatedEvent(
        user.id,
        new UserCreatedEvent.Payload(
          user.id,
          user.userType,
          user.email
        ),
        params.correlationId
      )
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

    if(firstName !== undefined && !firstName) {
      throw new InvalidDomainArgumentError(
        DomainErrorCode.INVALID_ARGUMENT,
        'firstName cannot be empty'
      );
    }
    if(lastName !== undefined && !lastName) {
      throw new InvalidDomainArgumentError(
        DomainErrorCode.INVALID_ARGUMENT,
        'lastName cannot be empty'
      );
    }
    if(email !== undefined && !email) {
      throw new InvalidDomainArgumentError(
        DomainErrorCode.INVALID_ARGUMENT,
        'email cannot be empty'
      );
    }

    if(firstName !== undefined) {
      this._firstName = firstName;
    }
    if(lastName !== undefined) {
      this._lastName = lastName;
    }
    if(email !== undefined) {
      this._email = email;
    }
    this._updatedAt = new Date();

    this.addDomainEvent(
      new UserUpdatedEvent(
        this.id,
        new UserUpdatedEvent.Payload(
          this.id,
          this.userType,
          this.email
        ),
        params.correlationId
      )
    )
  }

  public suspend(): void {
    if(this.isSuspended()) {
      throw new ConflictError(
        DomainErrorCode.USER_ALREADY_SUSPENDED,
        'User is already suspended');
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


  public static reconstitute(params: {
    id: number;
    userType: UserType;
    firstName: string;
    lastName: string;
    email: string;
    status: UserStatus;
    updatedAt: Date;
    createdAt: Date;
  }): User {
    return new User(
      params.id,
      params.userType,
      params.firstName,
      params.lastName,
      params.email,
      params.status,
      params.createdAt,
      params.updatedAt
    )
  }
}

export { User };