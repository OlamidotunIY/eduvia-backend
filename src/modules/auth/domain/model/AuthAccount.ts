import { AuthInvariantError } from '../errors';
import { AggregateRoot } from '@modules/shared';
import { AuthAccountId } from '../value-objects/auth-account-id.vo';
import { AuthEmailVerifiedEvent } from '../events';

class AuthAccount extends AggregateRoot<AuthAccountId> {
  private _accountId: string;
  private _providerId: string;
  private _userId: string;
  private _accessToken: string | null;
  private _refreshToken: string | null;
  private _idToken: string | null;
  private _accessTokenExpiresAt: Date | null;
  private _refreshTokenExpiresAt: Date | null;
  private _scope: string | null;
  private _password: string | null;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: AuthAccountId;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    accessTokenExpiresAt: Date | null;
    refreshTokenExpiresAt: Date | null;
    scope: string | null;
    password: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);
    this._accountId = params.accountId;
    this._providerId = params.providerId;
    this._userId = params.userId;
    this._accessToken = params.accessToken;
    this._refreshToken = params.refreshToken;
    this._idToken = params.idToken;
    this._accessTokenExpiresAt = params.accessTokenExpiresAt;
    this._refreshTokenExpiresAt = params.refreshTokenExpiresAt;
    this._scope = params.scope;
    this._password = params.password;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static createOAuthAccount(params: {
    id: AuthAccountId;
    accountId: string; // The ID from the provider (e.g., Google Sub ID)
    providerId: string; // e.g., 'google', 'github'
    userId: string; // Your internal User ID
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date;
    scope?: string;
  }): AuthAccount {
    const now = new Date();

    return new AuthAccount({
      id: params.id,
      accountId: params.accountId,
      providerId: params.providerId,
      userId: params.userId,
      accessToken: params.accessToken || null,
      refreshToken: params.refreshToken || null,
      idToken: params.idToken || null,
      accessTokenExpiresAt: params.accessTokenExpiresAt || null,
      refreshTokenExpiresAt: params.refreshTokenExpiresAt || null,
      scope: params.scope || null,
      password: null, // OAuth accounts usually don't have passwords
      createdAt: now,
      updatedAt: now,
    });
  }

  public static createCredentialsAccount(params: {
    id: AuthAccountId;
    userId: string;
    email: string;
    passwordHash: string;
    scope?: string;
  }): AuthAccount {
    const now = new Date();

    return new AuthAccount({
      id: params.id,
      accountId: params.email.trim().toLowerCase(),
      providerId: 'credentials',
      userId: params.userId,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: params.scope || 'user',
      password: params.passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }
  // Reconstitute from the Database (Prisma)
  public static reconstitute(params: {
    id: AuthAccountId;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    accessTokenExpiresAt: Date | null;
    refreshTokenExpiresAt: Date | null;
    scope: string | null;
    password: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AuthAccount {
    return new AuthAccount(params);
  }
  // --- Domain Logic / Behaviors ---
  /**
   * Update the OAuth tokens (e.g., after a refresh)
   */
  public updateTokens(params: {
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date;
  }): void {
    this._accessToken = params.accessToken;

    if (params.refreshToken) this._refreshToken = params.refreshToken;
    if (params.idToken) this._idToken = params.idToken;
    if (params.accessTokenExpiresAt)
      this._accessTokenExpiresAt = params.accessTokenExpiresAt;
    if (params.refreshTokenExpiresAt)
      this._refreshTokenExpiresAt = params.refreshTokenExpiresAt;

    this.touch();
  }
  /**
   * For accounts where provider is 'credentials'
   */
  public updatePassword(passwordHash: string): void {
    if (this._providerId !== 'credentials') {
      throw new AuthInvariantError(
        'Cannot set password for an OAuth provider account',
      );
    }
    this._password = passwordHash;
    this.touch();
  }

  public recordEmailVerified(correlationId: string): void {
    this.addDomainEvent(
      new AuthEmailVerifiedEvent(
        this.getId(),
        new AuthEmailVerifiedEvent.Payload(
          this.getId(),
          this._userId,
          this._accountId,
        ),
        correlationId,
      ),
    );
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
  // --- Getters ---
  public get accountId(): string {
    return this._accountId;
  }
  public get providerId(): string {
    return this._providerId;
  }
  public get userId(): string {
    return this._userId;
  }
  public get accessToken(): string | null {
    return this._accessToken;
  }
  public get refreshToken(): string | null {
    return this._refreshToken;
  }
  public get idToken(): string | null {
    return this._idToken;
  }
  public get accessTokenExpiresAt(): Date | null {
    return this._accessTokenExpiresAt;
  }
  public get refreshTokenExpiresAt(): Date | null {
    return this._refreshTokenExpiresAt;
  }
  public get scope(): string | null {
    return this._scope;
  }
  public get password(): string | null {
    return this._password;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
}

export { AuthAccount };
