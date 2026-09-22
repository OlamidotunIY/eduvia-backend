import { BaseRepository } from '../../../shared/domain/repository/base.repository';
import { Session } from '../model/Session';
import { SessionId } from '../value-objects/session-id.vo';

abstract class ISessionRepository extends BaseRepository<Session, SessionId> {
  public abstract findByUserId(userId: string): Promise<Session[]>;
  public abstract deleteByUserId(userId: string): Promise<void>;
}

export { ISessionRepository };
