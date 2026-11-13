import type { AuthTokensResult } from '../login/login.result';

export type AuthenticateGoogleNativeResult =
  | AuthTokensResult
  | {
      registrationStatus: 'pending';
      registrationRequestId: string;
      registrationContinuation: string;
    };
