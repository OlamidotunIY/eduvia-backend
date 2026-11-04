export interface CreatePendingRegistrationPayload {
  registrationRequestId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  emailVerified: boolean;
  timezone: string;
  correlationId: string;
  correlationId: string;
}

export interface CreatePendingRegistrationResult {
  id: string;
}
