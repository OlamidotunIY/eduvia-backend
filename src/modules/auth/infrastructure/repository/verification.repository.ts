import { Injectable } from '@nestjs/common';
import { Verification as PrismaVerification } from '@generated/prisma';
import { Verification } from '../../domain/model/Verification';
import { IVerificationRepository } from '../../domain/repository/verification.repository';
import { PrismaBaseRepository } from '../../../../shared/repository/prisma-base.repository';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { VerificationMapper } from '../mappers/verification.mapper';

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
}
