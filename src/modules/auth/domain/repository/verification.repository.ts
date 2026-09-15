import { BaseRepository } from '../../../shared/repository/base.repository';
import { Verification } from '../model/Verification';
import { VerificationId } from '../value-objects/verification-id.vo';

abstract class IVerificationRepository extends BaseRepository<
  Verification,
  VerificationId
> {
  abstract findPendingVerification(
    authAccountId: string,
  ): Promise<Verification | null>;
}

export { IVerificationRepository };
