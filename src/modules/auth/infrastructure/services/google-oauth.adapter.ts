import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { IGoogleOAuthPort, type GoogleOAuthIdentity } from '../../domain';

@Injectable()
export class GoogleOAuthAdapter implements IGoogleOAuthPort {
  createAuthorizationUrl(input: {
    state: string;
    codeChallenge: string;
  }): string {
    const { clientId, redirectUri } = this.config();
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: input.state,
      code_challenge: input.codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'select_account',
    }).toString();
    return url.toString();
  }

  async exchangeAuthorizationCode(input: {
    code: string;
    codeVerifier: string;
  }): Promise<GoogleOAuthIdentity> {
    const { clientId, clientSecret, redirectUri } = this.config();
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: input.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: input.codeVerifier,
      }),
    });
    const token = (await tokenResponse.json()) as Record<string, unknown>;
    const accessToken =
      typeof token.access_token === 'string' ? token.access_token : undefined;
    if (!tokenResponse.ok || !accessToken) {
      throw new UnauthorizedException(
        typeof token.error_description === 'string'
          ? token.error_description
          : 'Google authorization code was rejected',
      );
    }

    const profileResponse = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      { headers: { authorization: `Bearer ${accessToken}` } },
    );
    const profile = (await profileResponse.json()) as Record<string, unknown>;
    const subject = typeof profile.sub === 'string' ? profile.sub : undefined;
    const email = typeof profile.email === 'string' ? profile.email : undefined;
    const firstName =
      typeof profile.given_name === 'string' ? profile.given_name.trim() : '';
    const lastName =
      typeof profile.family_name === 'string' ? profile.family_name.trim() : '';
    if (
      !profileResponse.ok ||
      !subject ||
      !email ||
      profile.email_verified !== true ||
      !firstName ||
      !lastName
    ) {
      throw new UnauthorizedException(
        'Google must provide a verified email address and full name',
      );
    }

    return {
      subject,
      email: email.trim().toLowerCase(),
      firstName,
      lastName,
      pictureUrl: typeof profile.picture === 'string' ? profile.picture : null,
    };
  }

  private config(): { clientId: string; clientSecret: string; redirectUri: string } {
    const clientId = process.env['GOOGLE_OAUTH_CLIENT_ID'];
    const clientSecret = process.env['GOOGLE_OAUTH_CLIENT_SECRET'];
    const redirectUri =
      process.env['GOOGLE_OAUTH_REDIRECT_URI'] ??
      `${process.env['PUBLIC_API_URL'] ?? 'https://api.eduvia.name.ng'}/auth/google/callback`;
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('Google sign-in is not configured');
    }
    return { clientId, clientSecret, redirectUri };
  }
}
