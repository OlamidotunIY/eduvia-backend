export interface CreateAuthAccountPayload {
  id: number;
  credentialHash: string;
  scope: string;
  correlationId: string;
  profileData: {
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
  };
}

export interface CreateAuthAccountResult {
  id: number;
  preAuthToken: string;
  preAuthTokenExpiresAt: Date;
}
