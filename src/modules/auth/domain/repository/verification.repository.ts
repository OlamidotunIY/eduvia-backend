import { BaseRepository } from '../../../shared/domain/repository/base.repository';
import { Verification } from '../model/Verification';
import { VerificationId } from '../value-objects/verification-id.vo';
import { VerificationType } from '../value-objects/verification-type.v0';

abstract class IVerificationRepository extends BaseRepository<
  Verification,
  VerificationId
> {
  abstract findPendingVerification(
    identifier: string,
    verificationType?: VerificationType,
  ): Promise<Verification | null>;
}

export { IVerificationRepository };
