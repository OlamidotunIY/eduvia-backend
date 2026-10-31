export interface GetRegistrationStatusPayload {
  registrationRequestId: string;
  registrationContinuation: string;
}

export interface RegistrationStatusDTO {
  registrationRequestId: string;
  status: string;
  nextAction: string;
  session?: {
    sessionId: string;
    accessToken: string;
    accessTokenExpiresAt: Date;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  };
}
