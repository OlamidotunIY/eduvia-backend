import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { AuthStatus } from '../value-objects/auth-status.v0';
import { UserType } from '../../../user/domain/value-objects/user-type.v0';
import { AuthAccountCreatedEvent } from '../events/auth-account-created';
import { AccountSuspendedEvent } from '../events/account-suspended';
import { BusinessRuleViolationError } from '../../../shared/domain/errors/business-rule-violation-error';
import { DomainErrorCode } from '../../../shared/domain/errors/domain-error-code';
import { ConflictError } from '../../../shared/domain/errors/conflict-error';

class AuthAccount extends AggregateRoot<number> {
  public readonly userId: number;
  public readonly userType: UserType;
  private _credentialHash: string;
  private _scope: string;
  private _totpSecret: string | null;
  private _totpEnabled: boolean;
  private _authStatus: AuthStatus;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: number;
    userId: number;
    userType: UserType;
    credentialHash: string;
    scope: string;
    totpSecret: string | null;
    totpEnabled: boolean;
    authStatus: AuthStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);

    this.userId = params.userId;
    this.userType = params.userType;
    this._credentialHash = params.credentialHash;
    this._scope = params.scope;
    this._totpSecret = params.totpSecret;
    this._totpEnabled = params.totpEnabled;
    this._authStatus = params.authStatus;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public getId(): number {
    return this.id;
  }

  public get credentialHash(): string {
    return this._credentialHash;
  }

  public get scope(): string {
    return this._scope;
  }

  public get totpEnabled(): boolean {
    return this._totpEnabled;
  }

  public get authStatus(): AuthStatus {
    return this._authStatus;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public isActive(): boolean {
    return this._authStatus === AuthStatus.ACTIVE;
  }

  public isSuspended(): boolean {
    return this._authStatus === AuthStatus.SUSPENDED;
  }

  public isPendingEmailVerification(): boolean {
    return this._authStatus === AuthStatus.PENDING_EMAIL_VERIFICATION;
  }

  public isPendingPasswordReset(): boolean {
    return this._authStatus === AuthStatus.PENDING_PASSWORD_RESET;
  }

  public static create(params: {
    id: number;
    userId: number;
    userType: UserType;
    credentialHash: string;
    scope: string;
    correlationId: string;
  }): AuthAccount {
    if (!params.credentialHash.trim()) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
        'Credential hash cannot be empty',
      );
    }

    if (!params.scope.trim()) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
        'Scope cannot be empty',
      );
    }

    const now = new Date();

    const authAccount = new AuthAccount({
      id: params.id,
      userId: params.userId,
      userType: params.userType,
      credentialHash: params.credentialHash,
      scope: params.scope.trim(),
      totpSecret: null,
      totpEnabled: false,
      authStatus: AuthStatus.PENDING_EMAIL_VERIFICATION,
      createdAt: now,
      updatedAt: now,
    });

    authAccount.addDomainEvent(
      new AuthAccountCreatedEvent(
        authAccount.id,
        new AuthAccountCreatedEvent.Payload(authAccount.id, authAccount.userId),
        params.correlationId,
      ),
    );

    return authAccount;
  }

  public suspend(correlationId: string): void {
    if (this.isSuspended()) {
      throw new ConflictError(
        DomainErrorCode.AUTH_ACCOUNT_ALREADY_SUSPENDED,
        'AuthAccount is already suspended'
      );
    }

    this._authStatus = AuthStatus.SUSPENDED;

    this.touch();

    this.addDomainEvent(
      new AccountSuspendedEvent(
        this.id,
        new AccountSuspendedEvent.Payload(this.id, this.userId),
        correlationId,
      ),
    );
  }

  public activate(): void {
    if (this.isActive()) {
      return;
    }

    this._authStatus = AuthStatus.ACTIVE;

    this.touch();
  }

  public markPendingEmailVerification(): void {
    if (this.isPendingEmailVerification()) {
      return;
    }

    if (this.isSuspended()) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.AUTH_ACCOUNT_SUSPENDED,
        'A suspended account cannot be marked pending email verification',
      );
    }

    this._authStatus = AuthStatus.PENDING_EMAIL_VERIFICATION;

    this.touch();
  }

  public markPendingPasswordReset(): void {
    if (this.isPendingPasswordReset()) {
      return;
    }

    if (this.isSuspended()) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.AUTH_ACCOUNT_SUSPENDED,
        'A suspended account cannot be marked pending password reset',
      );
    }

    this._authStatus = AuthStatus.PENDING_PASSWORD_RESET;

    this.touch();
  }

  public enableTotp(secret: string): void {
    if (!secret.trim()) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
        'TOTP secret cannot be empty',
      );
    }

    if (this._totpEnabled) {
      throw new ConflictError(
        DomainErrorCode.TOTP_ALREADY_ENABLED,
        'TOTP is already enabled',
      );
    }

    this._totpSecret = secret;
    this._totpEnabled = true;

    this.touch();
  }

  public disableTotp(): void {
    if (!this._totpEnabled) {
      return;
    }

    this._totpEnabled = false;
    this._totpSecret = null;

    this.touch();
  }

  public getTotpSecretForPersistence(): string | null {
    return this._totpSecret;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  public static reconstitute(params: {
    id: number;
    userId: number;
    userType: UserType;
    credentialHash: string;
    scope: string;
    totpSecret: string | null;
    totpEnabled: boolean;
    authStatus: AuthStatus;
    createdAt: Date;
    updatedAt: Date;
  }): AuthAccount {
    return new AuthAccount(params);
  }
}

export { AuthAccount };
