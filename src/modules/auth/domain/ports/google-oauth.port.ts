export interface GoogleOAuthIdentity {
  subject: string;
  email: string;
  firstName: string;
  lastName: string;
  pictureUrl: string | null;
}

export abstract class IGoogleOAuthPort {
  abstract createAuthorizationUrl(input: {
    state: string;
    codeChallenge: string;
  }): string;

  abstract exchangeAuthorizationCode(input: {
    code: string;
    codeVerifier: string;
  }): Promise<GoogleOAuthIdentity>;
}
