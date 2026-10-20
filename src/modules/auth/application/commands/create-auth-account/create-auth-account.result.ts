export interface CreateAuthAccountPayload {
  userId: string;
  passwordHash: string;
  email: string;
  scope?: string;
  correlationId: string;
}

export interface CreateAuthAccountResult {
  id: string;
}
