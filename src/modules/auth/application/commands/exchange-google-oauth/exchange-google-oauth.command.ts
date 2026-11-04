import { Command } from '@nestjs/cqrs';
import type { ExchangeGoogleOAuthResult } from './exchange-google-oauth.result';

export class ExchangeGoogleOAuthCommand extends Command<ExchangeGoogleOAuthResult> {
  constructor(public readonly payload: { code: string }) {
    super();
  }
}
