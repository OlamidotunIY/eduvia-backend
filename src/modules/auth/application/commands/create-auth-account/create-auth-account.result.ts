export interface CreateAuthAccountPayload {
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
  id: string;
  preAuthToken: string;
  preAuthTokenExpiresAt: Date;
}
