export interface CreateAuthAccountPayload {
  userId: string;
  passwordHash: string;
  email: string;
  userType: string;
  scope?: string;
  correlationId: string;
}

export interface CreateAuthAccountResult {
  id: string;
}
