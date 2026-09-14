export interface AccessTokenPayload {
  sub: number;
  userId: number;
  userType: string;
  scope: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface PreAuthTokenPayload {
  authAccountId: number;
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

  abstract verifyAccessToken(token: string): Promise<AccessTokenPayload>;

  abstract generateRefreshToken(): Promise<GenerateRefreshTokenResult>;

  abstract generatePreAuthToken(params: {
    authAccountId: number;
  }): Promise<GeneratePreAuthTokenResult>;

  abstract verifyPreAuthToken(token: string): Promise<PreAuthTokenPayload>;
}

