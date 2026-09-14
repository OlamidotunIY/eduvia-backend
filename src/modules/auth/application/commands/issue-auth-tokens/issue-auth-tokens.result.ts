import { UserType } from '../../../../user/domain/value-objects/user-type.v0';

export interface IssueAuthTokensPayload {
  id: number;
  authAccountId: number;
  userId: number;
  userType: UserType;
  scope: string;
  ipAddress: string;
  userAgent: string;
  correlationId: string;
}

export interface IssueAuthTokensResult {
  sessionId: number;
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}
