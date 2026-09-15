export interface CreateAuthAccountPayload {
  id: number;
  userId: number;
  credentialHash: string;
  scope: string;
  correlationId: string;
}

export interface CreateAuthAccountResult {
  id: number;
  preAuthToken: string;
  preAuthTokenExpiresAt: Date;
}
