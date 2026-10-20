export interface AccessTokenPayload {
  sub: string;
  userId: string;
  userType: string;
  scope: string;
  sessionId: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface PreAuthTokenPayload {
  authAccountId: string;
  purpose: 'email_verification';
  iat: number;
  exp: number;
}

export interface GenerateAccessTokenResult {
  token: string;
  jti: string;
  expiresAt: Date;
}

export interface GenerateRefreshTokenResult {
  raw: string;
  hash: string;
  expiresAt: Date;
}

export interface GeneratePreAuthTokenResult {
  token: string;
  expiresAt: Date;
}

export abstract class ITokenPort {
  abstract generateAccessToken(
    payload: Omit<AccessTokenPayload, 'iat' | 'exp' | 'jti'>,
  ): Promise<GenerateAccessTokenResult>;

  abstract generateRefreshToken(): Promise<GenerateRefreshTokenResult>;

  abstract generatePreAuthToken(params: {
    authAccountId: string;
  }): Promise<GeneratePreAuthTokenResult>;
}

