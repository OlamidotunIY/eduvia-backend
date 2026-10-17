import { BaseRepository } from '@modules/shared';
import { PlatformSubjectId } from '../value-objects';
import { PlatformSubject } from '../entities';

export abstract class IPlatformSubjectRepository extends BaseRepository<PlatformSubject, PlatformSubjectId> {
  public abstract findByShortCode(shortCode: string): Promise<PlatformSubject | null>;
  public abstract findActive(): Promise<PlatformSubject[]>;
  public abstract findAll(): Promise<PlatformSubject[]>;
}
