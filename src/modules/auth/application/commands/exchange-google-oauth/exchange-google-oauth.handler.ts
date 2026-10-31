import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RedisService } from '@modules/shared';
import { ExchangeGoogleOAuthCommand } from './exchange-google-oauth.command';
import type { ExchangeGoogleOAuthResult } from './exchange-google-oauth.result';

@CommandHandler(ExchangeGoogleOAuthCommand)
export class ExchangeGoogleOAuthHandler implements ICommandHandler<
  ExchangeGoogleOAuthCommand,
  ExchangeGoogleOAuthResult
> {
  constructor(private readonly redis: RedisService) {}

  async execute(command: ExchangeGoogleOAuthCommand): Promise<ExchangeGoogleOAuthResult> {
    if (!command.payload.code) {
      throw new BadRequestException('OAuth exchange code is required');
    }
    const value = await this.redis
      .getClient()
      .getdel(`auth:google-oauth:exchange:${command.payload.code}`);
    if (!value) {
      throw new UnauthorizedException('OAuth exchange code is invalid or expired');
    }
    return JSON.parse(value) as AuthTokensResult;
  }
}
