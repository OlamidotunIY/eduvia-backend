import { Injectable } from '@nestjs/common';
import { Verification as PrismaVerification } from '@generated/prisma/client';
import { VerificationMapper } from '../mappers';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { IVerificationRepository, Verification } from '../../domain';

@Injectable()
export class PrismaVerificationRepository
  extends PrismaBaseRepository<Verification, PrismaVerification>
  implements IVerificationRepository
{
  constructor(prisma: PrismaService, mapper: VerificationMapper) {
    super(prisma, mapper);
  }

  protected get delegate() {
    return this.prisma.verification;
  }

  async findPendingVerification(authAccountId: number): Promise<Verification | null> {
    const record = await this.delegate.findFirst({
      where: {
        authAccountId,
        verificationStatus: 'pending', // adjust enum value if needed based on Prisma schema
      },
      orderBy: { createdAt: 'desc' }
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }
}
