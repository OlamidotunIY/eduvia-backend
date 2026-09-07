import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetVerificationQuery } from './get-verivication.query';
import { IVerificationRepository } from '../../../domain/repository/verification.repository';
import { VerificationDTO } from './get-verification.query.payload';

@QueryHandler(GetVerificationQuery)
export class GetVerificationHandler implements IQueryHandler<GetVerificationQuery> {
  constructor(
    private readonly verificationRepository: IVerificationRepository,
  ) {}

  async execute(query: GetVerificationQuery): Promise<VerificationDTO | null> {
    const { payload } = query;

    const verification = await this.verificationRepository.findById(
      payload.verificationId,
    );

    if (!verification) {
      return null;
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
