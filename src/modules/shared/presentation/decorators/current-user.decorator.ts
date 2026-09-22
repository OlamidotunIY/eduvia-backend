import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  sub: string;
  userId: string;
  userType: string;
  scope: string;
  sessionId: string;
  jti: string;
  iat: number;
  exp: number;
}

export const CurrentUser = createParamDecorator<
  undefined,
  ExecutionContext,
  CurrentUserPayload
>(
  (_data: undefined, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as CurrentUserPayload;
  },
);
