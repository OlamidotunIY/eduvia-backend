export interface FinalizeRegistrationPayload {
  registrationRequestId: string;
  userId: string;
  email: string;
  correlationId: string;
}

export interface FinalizeRegistrationResult {
  authAccountId: string;
}
