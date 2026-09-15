import { IssueAuthTokensResult } from '../issue-auth-tokens/issue-auth-tokens.result';

export interface CompleteVerificationPayload {
  authAccountId: number;
  value: string;
  ipAddress: string;
  userAgent: string;
  correlationId: string;
}
