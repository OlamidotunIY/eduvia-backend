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

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const payload = request.user as CurrentUserPayload | undefined;
    return data ? payload?.[data] : payload;
  },
);
