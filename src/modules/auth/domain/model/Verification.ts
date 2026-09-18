import { VerificationType } from '../value-objects/verification-type.v0';
import { VerificationStatus } from '../value-objects/verification-status.v0';
import { AuthVerificationCreatedEvent } from '../events/auth-verification-created';
import { AggregateRoot } from '../../../shared';
import { InvalidVerificationValue, AuthInvariantError } from '../errors';
import { VerificationNotPending } from '../errors/verification-not-pending.error';
import { VerificationId } from '../value-objects/verification-id.vo';

class Verification extends AggregateRoot<VerificationId> {
  public readonly authAccountId: string;
  public readonly verificationType: VerificationType;
  public readonly expiresAt: Date;
  public readonly createdAt: Date;
  private _identifier: string;
  private _valueHash: string;
  private _verificationStatus: VerificationStatus;
  private _attempts: number;
  private _maxAttempts: number;
  private _updatedAt: Date;

  private constructor(params: {
    id: VerificationId;
    authAccountId: string;
    identifier: string;
    valueHash: string;
    verificationType: VerificationType;
    verificationStatus: VerificationStatus;
    expiresAt: Date;
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);

    this.authAccountId = params.authAccountId;
    this._identifier = params.identifier;
    this._valueHash = params.valueHash;
    this.verificationType = params.verificationType;
    this._verificationStatus = params.verificationStatus;
    this.expiresAt = params.expiresAt;
    this._attempts = params.attempts;
    this._maxAttempts = params.maxAttempts;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public get identifier(): string {
    return this._identifier;
  }

  public get valueHash(): string {
    return this._valueHash;
  }

  public get verificationStatus(): VerificationStatus {
    return this._verificationStatus;
  }

  public get attempts(): number {
    return this._attempts;
  }

  public get maxAttempts(): number {
    return this._maxAttempts;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public isPending(): boolean {
    return this._verificationStatus === VerificationStatus.PENDING;
  }

  public isVerified(): boolean {
    return this._verificationStatus === VerificationStatus.VERIFIED;
  }

  public isExpired(): boolean {
    return (
      this._verificationStatus === VerificationStatus.EXPIRED ||
      new Date() >= this.expiresAt
    );
  }

  public hasExceededMaxAttempts(): boolean {
    return this._attempts >= this._maxAttempts;
  }

  public static create(params: {
    id: VerificationId;
    authAccountId: string;
    identifier: string;
    valueHash: string;
    verificationType: VerificationType;
    expiresAt: Date;
    maxAttempts: number;
    correlationId: string;
  }): Verification {
    if (!params.identifier.trim()) {
      throw new AuthInvariantError(
        'Verification identifier cannot be empty',
      );
    }

    if (!params.valueHash.trim()) {
      throw new AuthInvariantError(
        'Verification value hash cannot be empty',
      );
    }

    if (params.maxAttempts <= 0) {
      throw new AuthInvariantError(
        'maxAttempts must be greater than zero',
      );
    }

    const now = new Date();

    const verification = new Verification({
      id: params.id,
      authAccountId: params.authAccountId,
      identifier: params.identifier.trim(),
      valueHash: params.valueHash,
      verificationType: params.verificationType,
      verificationStatus: VerificationStatus.PENDING,
      expiresAt: params.expiresAt,
      attempts: 0,
      maxAttempts: params.maxAttempts,
      createdAt: now,
      updatedAt: now,
    });

    verification.addDomainEvent(
      new AuthVerificationCreatedEvent(
        verification.getId(),
        new AuthVerificationCreatedEvent.Payload(
          verification.getId(),
          verification.authAccountId,
          verification.identifier,
          verification.verificationType,
        ),
        params.correlationId,
      ),
    );

    return verification;
  }

  public async verify(
    value: string,
    compareValue: (value: string, hash: string) => Promise<boolean>,
  ): Promise<void> {
    if (!this.isPending()) {
      throw new VerificationNotPending()
    }

    if (this.isExpired()) {
      this._verificationStatus = VerificationStatus.EXPIRED;
      this.touch();

      throw new AuthInvariantError(
        'Verification has expired',
      );
    }

    if (this.hasExceededMaxAttempts()) {
      this._verificationStatus = VerificationStatus.MAX_ATTEMPTS_EXCEEDED;
      this.touch();

      throw new AuthInvariantError(
        'Maximum verification attempts exceeded',
      );
    }

    this._attempts += 1;
    this.touch();

    const isValid = await compareValue(value, this._valueHash);

    if (!isValid) {
      if (this.hasExceededMaxAttempts()) {
        this._verificationStatus = VerificationStatus.MAX_ATTEMPTS_EXCEEDED;

        this.touch();

        throw new AuthInvariantError(
          'Maximum verification attempts exceeded',
        );
      }

      throw new InvalidVerificationValue();
    }

    this._verificationStatus = VerificationStatus.VERIFIED;
    this.touch();
  }

  public expire(): void {
    if (
      this.isVerified() ||
      this._verificationStatus === VerificationStatus.EXPIRED ||
      this._verificationStatus === VerificationStatus.MAX_ATTEMPTS_EXCEEDED
    ) {
      return;
    }

    this._verificationStatus = VerificationStatus.EXPIRED;

    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  public static reconstitute(params: {
    id: VerificationId;
    authAccountId: string;
    identifier: string;
    valueHash: string;
    verificationType: VerificationType;
    verificationStatus: VerificationStatus;
    expiresAt: Date;
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    updatedAt: Date;
  }): Verification {
    return new Verification(params);
  }
}

export { Verification };
