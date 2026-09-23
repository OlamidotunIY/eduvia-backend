import { AggregateRoot } from '../../../shared';
import { AuthInvariantError } from '../errors';
import { SessionId } from '../value-objects';

export class Session extends AggregateRoot<SessionId> {
  private _expiresAt: Date;
  private _token: string;
  public readonly createdAt: Date;
  private _updatedAt: Date;
  private _ipAddress: string | null;
  private _userAgent: string | null;
  private _userId: string;

  private constructor(params: {
    id: SessionId;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
  }) {
    super(params.id);
    this._expiresAt = params.expiresAt;
    this._token = params.token;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
    this._ipAddress = params.ipAddress;
    this._userAgent = params.userAgent;
    this._userId = params.userId;
  }

  public static create(params: {
    id: SessionId;
    expiresAt: Date;
    token: string;
    userId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Session {
    if (!params.token.trim()) {
      throw new AuthInvariantError('Session token cannot be empty');
    }
    const now = new Date();
    return new Session({
      id: params.id,
      expiresAt: params.expiresAt,
      token: params.token,
      userId: params.userId,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(params: {
    id: SessionId;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
  }): Session {
    return new Session(params);
  }

  public extend(newExpiresAt: Date): void {
    if (newExpiresAt <= this._expiresAt) {
      throw new AuthInvariantError('New expiration date must be in the future');
    }
    this._expiresAt = newExpiresAt;
    this.touch();
  }

  public isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
  
  // Getters
  public get expiresAt(): Date {
    return this._expiresAt;
  }
  public get token(): string {
    return this._token;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
  public get ipAddress(): string | null {
    return this._ipAddress;
  }
  public get userAgent(): string | null {
    return this._userAgent;
  }
  public get userId(): string {
    return this._userId;
  }
}
