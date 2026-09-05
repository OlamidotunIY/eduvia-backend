import { BaseRepository } from "../../../shared/repository/base.repository";
import { Session } from "../model/Session";

abstract class ISessionRepository extends BaseRepository<Session, number> {
    
}

export { ISessionRepository };