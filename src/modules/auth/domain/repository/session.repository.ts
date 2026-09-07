import { BaseRepository } from "../../../shared/repository/base.repository";
import { Session } from "../model/Session";

abstract class ISessionRepository extends BaseRepository<Session, number> {
    public abstract findByUserId(userId: number): Promise<Session[]>;
    
}

export { ISessionRepository };