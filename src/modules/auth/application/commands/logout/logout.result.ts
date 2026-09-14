export interface LogoutPayload {
  sessionId: number;
  jti: string;
  correlationId: string;
}
