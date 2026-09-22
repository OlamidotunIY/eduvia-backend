import { Injectable } from '@nestjs/common';
import { Verification as PrismaVerification } from '@generated/prisma/client';
import { VerificationMapper } from '../mappers';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { IVerificationRepository, Verification, VerificationType } from '../../../domain';
import { VerificationId } from '../../../domain/value-objects/verification-id.vo';

@Injectable()
export class PrismaVerificationRepository
  extends PrismaBaseRepository<VerificationId, Verification, PrismaVerification>
  implements IVerificationRepository
{
  constructor(prisma: PrismaService, mapper: VerificationMapper) {
    super(prisma, mapper);
  }

  protected get delegate() {
    return this.prisma.verification;
  }

  async findPendingVerification(
    identifier: string,
    verificationType?: VerificationType,
  ): Promise<Verification | null> {
    const record = await this.delegate.findFirst({
      where: {
        identifier: identifier.trim().toLowerCase(),
        verificationType,
        verificationStatus: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }
}
