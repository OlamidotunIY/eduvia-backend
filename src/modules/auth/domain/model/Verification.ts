import { VerificationType } from '../value-objects/verification-type.v0';
import { VerificationStatus } from '../value-objects/verification-status.v0';
import { AggregateRoot } from '../../../shared';
import { AuthInvariantError } from '../errors';
import { VerificationId } from '../value-objects/verification-id.vo';
import { AuthVerificationCreatedEvent } from '../events';

export class Verification extends AggregateRoot<VerificationId> {
  private _identifier: string;
  private _valueHash: string;
  private _verificationType: VerificationType;
  private _verificationStatus: VerificationStatus;
  private _expiresAt: Date;
  private _attempts: number;
  private _maxAttempts: number;
  public readonly createdAt: Date;
  private _updatedAt: Date;
  private constructor(params: {
    id: VerificationId;
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
    this._identifier = params.identifier;
    this._valueHash = params.valueHash;
    this._verificationType = params.verificationType;
    this._verificationStatus = params.verificationStatus;
    this._expiresAt = params.expiresAt;
    this._attempts = params.attempts;
    this._maxAttempts = params.maxAttempts;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }
  public static create(params: {
    id: VerificationId;
    identifier: string;
    valueHash: string;
    verificationType: VerificationType;
    expiresAt: Date;
    maxAttempts: number;
    rawValueRedisKey?: string;
    correlationId: string;
  }): Verification {
    const now = new Date();

    const verification = new Verification({
      id: params.id,
      identifier: params.identifier,
      valueHash: params.valueHash,
      verificationType: params.verificationType,
      verificationStatus: VerificationStatus.PENDING, // assuming this exists
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
          verification.identifier,
          verification.verificationType,
          params.rawValueRedisKey,
        ),
        params.correlationId,
      ),
    );

    return verification;
  }
  public static reconstitute(params: {
    id: VerificationId;
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

  public recordAttempt(): void {
    if (this.isExpired()) {
      throw new AuthInvariantError('Cannot verify, token is expired');
    }

    this._attempts += 1;
    this.touch();
    if (this._attempts >= this._maxAttempts) {
      this._verificationStatus = VerificationStatus.MAX_ATTEMPTS_EXCEEDED; // assuming this exists
    }
  }

  public async verify(
    value: string,
    compare: (value: string, hash: string) => Promise<boolean>,
  ): Promise<void> {
    this.recordAttempt();

    const isValid = await compare(value, this._valueHash);
    if (!isValid) {
      throw new AuthInvariantError('Invalid verification value');
    }

    this.markAsVerified();
  }

  public markAsVerified(): void {
    if (this.isExpired()) throw new AuthInvariantError('Verification expired');
    if (this._attempts >= this._maxAttempts)
      throw new AuthInvariantError('Max attempts exceeded');
    this._verificationStatus = VerificationStatus.VERIFIED; // assuming this exists
    this.touch();
  }

  public isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  // Getters
  public get identifier(): string {
    return this._identifier;
  }
  public get valueHash(): string {
    return this._valueHash;
  }
  public get verificationType(): VerificationType {
    return this._verificationType;
  }
  public get verificationStatus(): VerificationStatus {
    return this._verificationStatus;
  }
  public get expiresAt(): Date {
    return this._expiresAt;
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
}
