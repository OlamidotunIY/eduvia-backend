export interface StartEmailRegistrationPayload {
  email: string;
  passwordRaw: string;
  firstName: string;
  lastName: string;
  timezone: string | undefined;
  correlationId: string;
}

export interface StartEmailRegistrationResult {
  registrationRequestId: string;
  registrationContinuation: string;
}
