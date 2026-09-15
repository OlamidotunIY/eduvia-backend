import { BaseRepository } from "../../../shared/repository/base.repository";
import { AuthAccount } from "../model/AuthAccount";

abstract class IAuthAccountRepository extends BaseRepository<AuthAccount, number> {
    abstract findByUserId(userId: number): Promise<AuthAccount | null>;
}

export { IAuthAccountRepository };
