export enum GoogleOAuthIntent {
  LOGIN = 'login',
  SIGNUP = 'signup',
}

export class GoogleOAuthState {
  private constructor(
    public readonly codeVerifier: string,
    public readonly intent: GoogleOAuthIntent,
    public readonly returnPath: string,
  ) {}

  static create(params: {
    codeVerifier: string;
    intent: GoogleOAuthIntent;
    returnPath: string;
  }): GoogleOAuthState {
    return new GoogleOAuthState(
      params.codeVerifier,
      params.intent,
      params.returnPath,
    );
  }

  static deserialize(value: string): GoogleOAuthState | null {
    try {
      const parsed = JSON.parse(value) as Record<string, unknown>;
      if (
        typeof parsed.codeVerifier !== 'string' ||
        typeof parsed.returnPath !== 'string' ||
        (parsed.intent !== GoogleOAuthIntent.LOGIN &&
          parsed.intent !== GoogleOAuthIntent.SIGNUP)
      ) {
        return null;
      }
      return GoogleOAuthState.create({
        codeVerifier: parsed.codeVerifier,
        intent: parsed.intent,
        returnPath: parsed.returnPath,
      });
    } catch {
      return null;
    }
  }

  serialize(): string {
    return JSON.stringify({
      codeVerifier: this.codeVerifier,
      intent: this.intent,
      returnPath: this.returnPath,
    });
  }
}
