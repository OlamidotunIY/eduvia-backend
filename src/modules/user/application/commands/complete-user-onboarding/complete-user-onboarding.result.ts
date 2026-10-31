export interface CompleteUserOnboardingPayload {
  userId: string;
  userType: UserType;
  firstName: string;
  lastName: string;
  timezone: string | undefined;
  correlationId: string;
  correlationId: string;
}

export interface CompleteUserOnboardingResult {
  id: string;
}
