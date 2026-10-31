import { Command } from '@nestjs/cqrs';
import type { GoogleOAuthIntent } from '../../../domain';
import type { StartGoogleOAuthResult } from './start-google-oauth.result';

export class StartGoogleOAuthCommand extends Command<StartGoogleOAuthResult> {
  constructor(
    public readonly payload: {
      intent?: GoogleOAuthIntent;
      returnPath?: string;
    },
  ) {
    super();
  }
}
