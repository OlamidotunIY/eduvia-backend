import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { IOrganizationAuthorizationQueryPort } from '../../application/port';
import { ORGANIZATION_PERMISSIONS_KEY } from '../decorators';
import type { CurrentUserPayload } from '../decorators';

@Injectable()
export class OrganizationPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.getAllAndOverride<string[]>(
      ORGANIZATION_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!permissions?.length) return true;

    const request = context.switchToHttp().getRequest();
    const organizationId = request.params.organizationId as string | undefined;
    const currentUser = request.user as CurrentUserPayload | undefined;
    if (!organizationId || !currentUser?.userId) {
      throw new ForbiddenException('Organization context is required');
    }

    const authorizationQuery = this.moduleRef.get(
      IOrganizationAuthorizationQueryPort,
      { strict: false },
    );
    const authorization = await authorizationQuery.getEffectiveAuthorization(
      organizationId,
      currentUser.userId,
    );
    if (
      !authorization?.isActive ||
      !permissions.every((permission) => authorization.permissions.includes(permission))
    ) {
      throw new ForbiddenException('You do not have permission to perform this organization action');
    }

    request.organizationAuthorization = authorization;
    return true;
  }
}
