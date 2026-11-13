import { Command } from '@nestjs/cqrs';
import type { GoogleOAuthIntent } from '../../../domain';
import type { AuthenticateGoogleNativeResult } from './authenticate-google-native.result';

export class AuthenticateGoogleNativeCommand extends Command<AuthenticateGoogleNativeResult> {
  constructor(
    public readonly payload: {
      idToken: string;
      intent?: GoogleOAuthIntent;
      ipAddress: string;
      userAgent: string;
      correlationId: string;
    },
  ) {
    super();
  }
}
