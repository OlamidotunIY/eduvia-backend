import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  IPlatformAdminQueryPort,
  type CurrentUserPayload,
} from '@modules/shared';

/**
 * Curriculum is platform-owned. Organization permissions deliberately do not
 * grant access here: they only grant access to the scoped organization routes.
 */
@Injectable()
export class CurriculumEditorGuard implements CanActivate {
  constructor(private readonly platformAdminQuery: IPlatformAdminQueryPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload | undefined;
    const userId = user?.userId ?? user?.sub;
    if (!userId) {
      throw new ForbiddenException('Platform curriculum access is required');
    }

    const admin = await this.platformAdminQuery.getPlatformAdminByUserId(userId);
    if (
      !admin ||
      !['PlatformSuperAdmin', 'CurriculumEditor'].includes(admin.role)
    ) {
      throw new ForbiddenException('Platform curriculum editor access is required');
    }

    return true;
  }
}
