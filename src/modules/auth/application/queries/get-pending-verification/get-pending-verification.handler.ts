import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPendingVerificationQuery } from './get-pending-verification.query';
import { IVerificationRepository } from '../../../domain/repository/verification.repository';
import { VerificationDTO } from '../get-verification/get-verification.query.payload';

@QueryHandler(GetPendingVerificationQuery)
export class GetPendingVerificationHandler implements IQueryHandler<GetPendingVerificationQuery> {
  constructor(private readonly verificationRepository: IVerificationRepository) {}

  async execute(query: GetPendingVerificationQuery): Promise<VerificationDTO> {
    const { payload } = query;

    const verification = await this.verificationRepository.findPendingVerification(
      payload.authAccountId,
    );

    if (!verification) {
      throw new Error("No pending verification found");
    }

    return {
      id: verification.getId(),
      authAccountId: verification.authAccountId,
      identifier: verification.identifier,
      verificationType: verification.verificationType,
      verificationStatus: verification.verificationStatus,
      expiresAt: verification.expiresAt,
      attempts: verification.attempts,
      maxAttempts: verification.maxAttempts,
      createdAt: verification.createdAt,
      updatedAt: verification.updatedAt,
    };
  }
}
