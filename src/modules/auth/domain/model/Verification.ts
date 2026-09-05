import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { VerificationType } from '../value-objects/verification-type.v0';
import { VerificationStatus } from '../value-objects/verification-status.v0';
import { AuthVerificationCreatedEvent } from '../events/auth-verification-created';
import { BusinessRuleViolationError } from '../../../shared/domain/errors/business-rule-violation-error';
import { DomainErrorCode } from '../../../shared/domain/errors/domain-error-code';
import { InvalidDomainArgumentError } from '../../../shared/domain/errors/invalid-domain-error-argument';

class Verification extends AggregateRoot<number> {
  public readonly authAccountId: number;
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
    id: number;
    authAccountId: number;
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

  public getId(): number {
    return this.id;
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
    return this._attempts > this._maxAttempts;
  }

  public static create(params: {
    id: number;
    authAccountId: number;
    identifier: string;
    valueHash: string;
    verificationType: VerificationType;
    expiresAt: Date;
    maxAttempts: number;
    correlationId: string;
  }): Verification {
    if (!params.identifier.trim()) {
      throw new InvalidDomainArgumentError(
        DomainErrorCode.INVALID_ARGUMENT,
        'Verification identifier cannot be empty',
      );
    }

    if (!params.valueHash.trim()) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
        'Verification value hash cannot be empty',
      );
    }

    if (params.maxAttempts <= 0) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
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
        verification.id,
        new AuthVerificationCreatedEvent.Payload(
          verification.id,
          verification.authAccountId,
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
      throw new BusinessRuleViolationError(
        DomainErrorCode.VERIFICATION_NOT_PENDING,
        'Verification is no longer pending',
      );
    }

    if (this.isExpired()) {
      this._verificationStatus = VerificationStatus.EXPIRED;
      this.touch();

      throw new BusinessRuleViolationError(
        DomainErrorCode.VERIFICATION_EXPIRED,
        'Verification has expired',
      );
    }

    if (this.hasExceededMaxAttempts()) {
      this._verificationStatus = VerificationStatus.MAX_ATTEMPTS_EXCEEDED;
      this.touch();

      throw new BusinessRuleViolationError(
        DomainErrorCode.VERIFICATION_MAX_ATTEMPTS_EXCEEDED,
        'Maximum verification attempts exceeded',
      );
    }

    this._attempts += 1;
    this.touch();

    const isValid = await compareValue(value, this._valueHash);

    if (!isValid) {
      if (this.hasExceededMaxAttempts()) {
        this._verificationStatus =
          VerificationStatus.MAX_ATTEMPTS_EXCEEDED;

        this.touch();

        throw new BusinessRuleViolationError(
          DomainErrorCode.VERIFICATION_MAX_ATTEMPTS_EXCEEDED,
          'Maximum verification attempts exceeded',
        );
      }

      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
        'Invalid verification value',
      );
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
    id: number;
    authAccountId: number;
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