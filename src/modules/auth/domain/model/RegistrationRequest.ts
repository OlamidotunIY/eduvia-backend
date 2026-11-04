import { AggregateRoot } from '@modules/shared';
import { RegistrationRequestId } from '../value-objects/registration-request-id.vo';
import { RegistrationStatus } from '../value-objects/registration-status.vo';
import { UserRegistrationRequestedEvent } from '../events';

class RegistrationRequest extends AggregateRoot<RegistrationRequestId> {
  public readonly email: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly imageUrl: string | null;
  public readonly emailVerified: boolean;
  public readonly timezone: string;
  public readonly providerId: string;
  public readonly providerAccountId: string | null;
  private _passwordHash: string | null;
  private _status: RegistrationStatus;
  private _userId: string | null;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: RegistrationRequestId;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    emailVerified: boolean;
    timezone: string;
    providerId: string;
    providerAccountId: string | null;
    passwordHash: string | null;
    status: RegistrationStatus;
    userId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);
    this.email = params.email;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.imageUrl = params.imageUrl;
    this.emailVerified = params.emailVerified;
    this.timezone = params.timezone;
    this.providerId = params.providerId;
    this.providerAccountId = params.providerAccountId;
    this._passwordHash = params.passwordHash;
    this._status = params.status;
    this._userId = params.userId;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static create(params: {
    id: RegistrationRequestId;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    emailVerified: boolean;
    timezone: string;
    providerId: string;
    providerAccountId: string | null;
    passwordHash: string | null;
    correlationId: string;
  }): RegistrationRequest {
    const now = new Date();
    const entity = new RegistrationRequest({
      ...params,
      status: RegistrationStatus.PENDING,
      userId: null,
      createdAt: now,
      updatedAt: now,
    });

    entity.addDomainEvent(
      new UserRegistrationRequestedEvent(
        entity.getId(),
        new UserRegistrationRequestedEvent.Payload(
          entity.getId(),
          entity.email,
          entity.firstName,
          entity.lastName,
          entity.imageUrl,
          entity.emailVerified,
          entity.timezone,
        ),
        params.correlationId,
      ),
    );

    return entity;
  }

  public static reconstitute(params: {
    id: RegistrationRequestId;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    emailVerified: boolean;
    timezone: string;
    providerId: string;
    providerAccountId: string | null;
    passwordHash: string | null;
    status: RegistrationStatus;
    userId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): RegistrationRequest {
    return new RegistrationRequest(params);
  }

  public get passwordHash(): string | null {
    return this._passwordHash;
  }

  public get status(): RegistrationStatus {
    return this._status;
  }

  public get userId(): string | null {
    return this._userId;
  }

  public recordUserCreated(userId: string): void {
    if (this._status === RegistrationStatus.COMPLETED) return;
    this._userId = userId;
    this._status = RegistrationStatus.USER_CREATED;
    this.touch();
  }

  public complete(): void {
    this._status = RegistrationStatus.COMPLETED;
    this.touch();
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}

export { RegistrationRequest };
