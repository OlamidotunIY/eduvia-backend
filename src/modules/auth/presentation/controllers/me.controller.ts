import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  CurrentUserPayload,
} from '@modules/shared';

@UseGuards(AuthGuard)
@Controller('')
export class MeController {
  constructor(private readonly auth: AuthService) {}

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
