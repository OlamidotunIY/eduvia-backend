import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { BusinessRuleViolationError } from '../../../shared/domain/errors/business-rule-violation-error';
import { DomainErrorCode } from '../../../shared/domain/errors/domain-error-code';
import { UserType } from '../../../user/domain/value-objects/user-type.v0';
import { AuthSessionCreatedEvent } from '../events/auth-session-created';
import { TokenIssuedEvent } from '../events/token-issued';
import { SessionStatus } from '../value-objects/session-stutus.v0';

class Session extends AggregateRoot<number> {
  public readonly authAccountId: number;
  public readonly userId: number;
  public readonly userType: UserType;
  public readonly createdAt: Date;
  private _refreshTokenHash: string;
  private _accessTokenExpiresAt: Date;
  private _refreshTokenExpiresAt: Date;
  private _ipAddress: string;
  private _userAgent: string;
  private _sessionStatus: SessionStatus;
  private _revokedAt: Date | null;
  private _updatedAt: Date;

  private constructor(params: {
    id: number;
    authAccountId: number;
    userId: number;
    userType: UserType;
    refreshTokenHash: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    ipAddress: string;
    userAgent: string;
    sessionStatus: SessionStatus;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);

    this.authAccountId = params.authAccountId;
    this.userId = params.userId;
    this.userType = params.userType;
    this._refreshTokenHash = params.refreshTokenHash;
    this._accessTokenExpiresAt = params.accessTokenExpiresAt;
    this._refreshTokenExpiresAt = params.refreshTokenExpiresAt;
    this._ipAddress = params.ipAddress;
    this._userAgent = params.userAgent;
    this._sessionStatus = params.sessionStatus;
    this._revokedAt = params.revokedAt;
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public getId(): number {
    return this.id;
  }

  public get refreshTokenHash(): string {
    return this._refreshTokenHash;
  }

  public get accessTokenExpiresAt(): Date {
    return this._accessTokenExpiresAt;
  }

  public get refreshTokenExpiresAt(): Date {
    return this._refreshTokenExpiresAt;
  }

  public get ipAddress(): string {
    return this._ipAddress;
  }

  public get userAgent(): string {
    return this._userAgent;
  }

  public get sessionStatus(): SessionStatus {
    return this._sessionStatus;
  }

  public get revokedAt(): Date | null {
    return this._revokedAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public isActive(): boolean {
    return this._sessionStatus === SessionStatus.ACTIVE;
  }

  public isRevoked(): boolean {
    return this._sessionStatus === SessionStatus.REVOKED;
  }

  public isExpired(): boolean {
    return (
      this._sessionStatus === SessionStatus.EXPIRED ||
      new Date() > this._refreshTokenExpiresAt
    );
  }

  public static create(params: {
    id: number;
    authAccountId: number;
    userId: number;
    userType: UserType;
    refreshTokenHash: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    ipAddress: string;
    userAgent: string;
    correlationId: string;
  }): Session {
    if (!params.refreshTokenHash.trim()) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
        'Refresh token hash cannot be empty',
      );
    }

    if (!params.ipAddress.trim()) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
        'IP address cannot be empty',
      );
    }

    if (!params.userAgent.trim()) {
      throw new BusinessRuleViolationError(
        DomainErrorCode.INVALID_ARGUMENT,
        'User agent cannot be empty',
      );
    }

    const now = new Date();

    const session = new Session({
      id: params.id,
      authAccountId: params.authAccountId,
      userId: params.userId,
      userType: params.userType,
      refreshTokenHash: params.refreshTokenHash,
      accessTokenExpiresAt: params.accessTokenExpiresAt,
      refreshTokenExpiresAt: params.refreshTokenExpiresAt,
      ipAddress: params.ipAddress.trim(),
      userAgent: params.userAgent.trim(),
      sessionStatus: SessionStatus.ACTIVE,
      revokedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    session.addDomainEvent(
      new AuthSessionCreatedEvent(
        session.id,
        new AuthSessionCreatedEvent.Payload(
          session.authAccountId,
          session.userId,
        ),
        params.correlationId,
      ),
    );

    session.addDomainEvent(
      new TokenIssuedEvent(
        session.id,
        new TokenIssuedEvent.Payload(session.authAccountId, session.userId),
        params.correlationId,
      ),
    );

    return session;
  }

  public revoke(): void {
    if (this.isRevoked()) {
      return;
    }

    this._sessionStatus = SessionStatus.REVOKED;
    this._revokedAt = new Date();

    this.touch();
  }

  public expire(): void {
    if (this._sessionStatus === SessionStatus.EXPIRED) {
      return;
    }

    this._sessionStatus = SessionStatus.EXPIRED;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  public static reconstitute(params: {
    id: number;
    authAccountId: number;
    userId: number;
    userType: UserType;
    refreshTokenHash: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
    ipAddress: string;
    userAgent: string;
    sessionStatus: SessionStatus;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Session {
    return new Session(params);
  }
}

export { Session };
