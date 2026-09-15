import { UserType } from "@modules/user";

export interface IssueAuthTokensPayload {
  authAccountId: string;
  userId: string;
  userType: UserType;
  scope: string;
  ipAddress: string;
  userAgent: string;
  correlationId: string;
}

export interface IssueAuthTokensResult {
  sessionId: string;
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}
