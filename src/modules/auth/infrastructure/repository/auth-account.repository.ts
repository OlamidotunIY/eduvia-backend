import { Injectable } from '@nestjs/common';
import { AuthAccount as PrismaAuthAccount } from '@generated/prisma/client';
import { AuthAccountMapper } from '../mappers';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { AuthAccount, IAuthAccountRepository } from '../../domain';

@Injectable()
export class PrismaAuthAccountRepository
  extends PrismaBaseRepository<AuthAccount, PrismaAuthAccount>
  implements IAuthAccountRepository
{
  constructor(prisma: PrismaService, mapper: AuthAccountMapper) {
    super(prisma, mapper);
  }

  protected get delegate() {
    return this.prisma.authAccount;
  }

  async findByUserId(userId: number): Promise<AuthAccount | null> {
    const record = await this.delegate.findUnique({
      where: { userId },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }
}
