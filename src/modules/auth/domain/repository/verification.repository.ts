import { BaseRepository } from "../../../shared/repository/base.repository";
import { Verification } from "../model/Verification";

abstract class IVerificationRepository extends BaseRepository<Verification, number> {
    abstract findPendingVerification(authAccountId: number): Promise<Verification | null>;
}

export { IVerificationRepository };
