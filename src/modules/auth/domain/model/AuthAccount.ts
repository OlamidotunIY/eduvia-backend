import { AccountSuspendedEvent, AuthAccountCreatedEvent } from '../events';
import { AuthStatus } from '../value-objects/auth-status.v0';
import {
  AuthAccountAlreadySuspendedError,
  AuthInvariantError,
} from '../errors';
import { AggregateRoot } from '@modules/shared';

class AuthAccount extends AggregateRoot<number> {
  public userId: number | null;
  private _credentialHash: string;
  private _scope: string;
  private _totpSecret: string | null;
  private _totpEnabled: boolean;
  private _authStatus: AuthStatus;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: number;
    userId: number | null;
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
    this._credentialHash = params.credentialHash;
    this._scope = params.scope;
    this._totpSecret = params.totpSecret;
    this._totpEnabled = params.totpEnabled;
    this._authStatus = params.authStatus;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static reconstitute(params: {
    id: number;
    userId: number | null;
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

  public static create(params: {
    id: number;
    credentialHash: string;
    scope: string;
    correlationId: string;
    preAuthToken: string;
    profileData: {
      email: string;
      firstName: string;
      lastName: string;
      userType: string;
    };
  }): AuthAccount {
    if (!params.credentialHash.trim()) {
      throw new AuthInvariantError('Credential hash cannot be empty');
    }

    if (!params.scope.trim()) {
      throw new AuthInvariantError('Scope cannot be empty');
    }

    const now = new Date();

    const authAccount = new AuthAccount({
      id: params.id,
      userId: null,
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
        new AuthAccountCreatedEvent.Payload(
          authAccount.id,
          params.preAuthToken,
          params.profileData,
        ),
        params.correlationId,
      ),
    );

    return authAccount;
  }

  public linkUser(userId: number): void {
    if (this.userId !== null) {
      throw new AuthInvariantError('AuthAccount is already linked to a user');
    }
    this.userId = userId;
    this.touch();
  }

  public updateCredentials(credentialHash: string): void {
    if (!credentialHash.trim()) {
      throw new AuthInvariantError('Credential hash cannot be empty');
    }

    this._credentialHash = credentialHash;
    this.touch();
  }

  public suspend(correlationId: string): void {
    if (this.isSuspended()) {
      throw new AuthAccountAlreadySuspendedError();
    }

    this._authStatus = AuthStatus.SUSPENDED;

    this.touch();

    this.addDomainEvent(
      new AccountSuspendedEvent(
        this.id,
        new AccountSuspendedEvent.Payload(this.id, this.userId as number),
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
      throw new AuthInvariantError(
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
      throw new AuthInvariantError(
        'A suspended account cannot be marked pending password reset',
      );
    }

    this._authStatus = AuthStatus.PENDING_PASSWORD_RESET;

    this.touch();
  }

  public enableTotp(secret: string): void {
    if (!secret.trim()) {
      throw new AuthInvariantError('TOTP secret cannot be empty');
    }

    if (this._totpEnabled) {
      throw new AuthInvariantError('TOTP is already enabled');
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
}

export { AuthAccount };
