import { IssueAuthTokensResult } from '../issue-auth-tokens/issue-auth-tokens.result';

export interface CompleteVerificationPayload {
  authAccountId: string;
  value: string;
  ipAddress: string;
  userAgent: string;
  correlationId: string;
}
