import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { createHash, randomBytes } from 'node:crypto';
import {
  GoogleOAuthIntent,
  GoogleOAuthState,
  IGoogleOAuthPort,
} from '../../../domain';
import { RedisService } from '@modules/shared';
import { StartGoogleOAuthCommand } from './start-google-oauth.command';
import type { StartGoogleOAuthResult } from './start-google-oauth.result';

@CommandHandler(StartGoogleOAuthCommand)
export class StartGoogleOAuthHandler implements ICommandHandler<
  StartGoogleOAuthCommand,
  StartGoogleOAuthResult
> {
  constructor(
    private readonly googleOAuth: IGoogleOAuthPort,
    private readonly redis: RedisService,
  ) {}

  async execute(command: StartGoogleOAuthCommand) {
    const intent = command.payload.intent ?? GoogleOAuthIntent.LOGIN;

    const state = randomBytes(32).toString('base64url');
    const codeVerifier = randomBytes(48).toString('base64url');
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    const storedState = GoogleOAuthState.create({
      codeVerifier,
      intent,
      returnPath: this.returnPath(command.payload.returnPath),
    });
    await this.redis
      .getClient()
      .set(`auth:google-oauth:state:${state}`, storedState.serialize(), 'EX', 600);

    return {
      authorizationUrl: this.googleOAuth.createAuthorizationUrl({
        state,
        codeChallenge,
      }),
    };
  }

  private returnPath(value: string | undefined): string {
    const returnPath = value ?? '/auth/oauth/callback';
    if (!returnPath.startsWith('/') || returnPath.startsWith('//')) {
      throw new BadRequestException('OAuth returnPath must be a relative path');
    }
    return returnPath;
  }
}
