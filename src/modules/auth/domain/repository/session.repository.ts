import { BaseRepository } from "../../../shared/repository/base.repository";
import { Session } from "../model/Session";
import { SessionId } from '../value-objects/session-id.vo';

abstract class ISessionRepository extends BaseRepository<Session, SessionId> {
    public abstract findByUserId(userId: string): Promise<Session[]>;
    
}

export { ISessionRepository };
