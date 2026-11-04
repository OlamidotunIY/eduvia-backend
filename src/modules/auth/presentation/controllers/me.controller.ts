import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';

@UseGuards(AuthGuard)
@Controller('')
export class MeController {
  constructor(private readonly auth: AuthService) {}

  @Get('me')
  async getMe(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.auth.getCurrentUserBootstrap(currentUser.userId);
  }

  @Post('logout')
  async logout(
    @CurrentUser() currentUser: CurrentUserPayload,
    @CorrelationId() correlationId: string,
  ) {
    return this.auth.logout(
      { sessionId: currentUser.sessionId, jti: currentUser.jti },
      correlationId,
    );
  }
}
