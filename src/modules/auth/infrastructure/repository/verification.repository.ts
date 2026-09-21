import { Injectable } from '@nestjs/common';
import { Verification as PrismaVerification } from '@generated/prisma/client';
import { VerificationMapper } from '../mappers';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { IVerificationRepository, Verification } from '../../domain';
import { VerificationId } from '../../domain/value-objects/verification-id.vo';

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
    authAccountId: string,
  ): Promise<Verification | null> {
    const record = await this.delegate.findFirst({
      where: {
        authAccountId,
        verificationStatus: 'pending', // adjust enum value if needed based on Prisma schema
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }
}
