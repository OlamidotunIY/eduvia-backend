import { BaseRepository } from '@modules/shared/domain';
import { PlatformAdminId, PlatformAdminRole } from '../value-objects';
import { PlatformAdmin } from '../entities/platform-admin.entity';

export abstract class IPlatformAdminRepository extends BaseRepository<
  PlatformAdmin,
  PlatformAdminId
> {
  public abstract findByUserId(userId: string): Promise<PlatformAdmin | null>;
  public abstract findByRole(role: PlatformAdminRole): Promise<PlatformAdmin[]>;
}
