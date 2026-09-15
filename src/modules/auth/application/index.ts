// Command handlers
export { CreateAuthAccountHandler } from './commands/create-auth-account/create-auth-account.handler';
export { CreateAuthAccountCommand } from './commands/create-auth-account/create-auth-account.command';
export type { CreateAuthAccountPayload, CreateAuthAccountResult } from './commands/create-auth-account/create-auth-account.result';

export { CompleteVerificationHandler } from './commands/complete-verification/complete-verification.handler';
export { CompleteVerificationCommand } from './commands/complete-verification/complete-verification.command';
export type { CompleteVerificationPayload } from './commands/complete-verification/complete-verification.result';

export { SuspendAuthAccountHandler } from './commands/suspend-auth-account/suspend-auth-account.handler';
export { SuspendAuthAccountCommand } from './commands/suspend-auth-account/suspend-auth-account.command';

export { UpdateCredentialsHandler } from './commands/update-credential/update-credential.handler';
export { UpdateCredentialsCommand } from './commands/update-credential/update-credential.command';
export type { UpdateCredentialsPayload } from './commands/update-credential/update-credential.result';

export { RevokeAllSessionsHandler } from './commands/revoke-all-sessions/revoke-all-sessions.handler';
export { RevokeAllSessionCommand } from './commands/revoke-all-sessions/rekove-all-sessions.command';

export { IssueAuthTokensHandler } from './commands/issue-auth-tokens/issue-auth-tokens.handler';
export { IssueAuthTokensCommand } from './commands/issue-auth-tokens/issue-auth-tokens.command';
export type { IssueAuthTokensPayload, IssueAuthTokensResult } from './commands/issue-auth-tokens/issue-auth-tokens.result';

export { LogoutHandler } from './commands/logout/logout.handler';
export { LogoutCommand } from './commands/logout/logout.command';
export type { LogoutPayload } from './commands/logout/logout.result';

export { ResendOtpHandler } from './commands/resend-otp/resend-otp.handler';
export { ResendOtpCommand } from './commands/resend-otp/resend-otp.command';

// Query handlers
export { GetAuthAccountHandler } from './queries/get-auth-account/get-auth-account.handler';
export { GetAuthAccountQuery } from './queries/get-auth-account/get-auth-account-query';
export type { GetAuthAccountPayload, AuthAccountDTO } from './queries/get-auth-account/get-auth-account.query.payload';

export { GetAuthAccountByUserIdHandler } from './queries/get-auth-account-by-user-id/get-auth-account-by-user-id.handler';
export { GetAuthAccountByUserIdQuery } from './queries/get-auth-account-by-user-id/get-auth-account-by-user-id.query';

export { GetSessionHandler } from './queries/get-session/get-session.handler';
export { GetSessionQuery } from './queries/get-session/get-session.query';
export type { GetSessionPayload, SessionDTO } from './queries/get-session/get-session.query.payload';

export { GetVerificationHandler } from './queries/get-verification/get-verification.handler';
export { GetVerificationQuery } from './queries/get-verification/get-verivication.query';
export type { GetVerificationPayload, VerificationDTO } from './queries/get-verification/get-verification.query.payload';

export { GetPendingVerificationHandler } from './queries/get-pending-verification/get-pending-verification.handler';
export { GetPendingVerificationQuery } from './queries/get-pending-verification/get-pending-verification.query';
