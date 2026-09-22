// Command handlers
export { CreateAuthAccountHandler } from './commands/create-auth-account/create-auth-account.handler';
export { CreateAuthAccountCommand } from './commands/create-auth-account/create-auth-account.command';
export type {
  CreateAuthAccountPayload,
  CreateAuthAccountResult,
} from './commands/create-auth-account/create-auth-account.result';

export { CompleteVerificationHandler } from './commands/complete-verification/complete-verification.handler';
export { CompleteVerificationCommand } from './commands/complete-verification/complete-verification.command';
export type { CompleteVerificationPayload } from './commands/complete-verification/complete-verification.result';

export { ChangePasswordHandler } from './commands/change-password/change-password.handler';
export { ChangePasswordCommand } from './commands/change-password/change-password.command';

export { LoginHandler } from './commands/login/login.handler';
export { LoginCommand } from './commands/login/login.command';
export type { AuthTokensResult } from './commands/login/login.result';

export { RevokeAllSessionsHandler } from './commands/revoke-all-sessions/revoke-all-sessions.handler';
export { RevokeAllSessionCommand } from './commands/revoke-all-sessions/rekove-all-sessions.command';

export { LogoutHandler } from './commands/logout/logout.handler';
export { LogoutCommand } from './commands/logout/logout.command';
export type { LogoutPayload } from './commands/logout/logout.result';

export { ResendOtpHandler } from './commands/resend-otp/resend-otp.handler';
export { ResendOtpCommand } from './commands/resend-otp/resend-otp.command';

export { RequestPasswordResetHandler } from './commands/request-password-reset/request-password-reset.handler';
export { RequestPasswordResetCommand } from './commands/request-password-reset/request-password-reset.command';

export * from './queries';
