import { Injectable } from '@nestjs/common';
import { AuthAccount as PrismaAuthAccount } from '@generated/prisma/client';
import { AuthAccountMapper } from '../mappers';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { AuthAccount, IAuthAccountRepository } from '../../domain';
import { AuthAccountId } from '../../domain/value-objects/auth-account-id.vo';

@Injectable()
export class PrismaAuthAccountRepository
  extends PrismaBaseRepository<AuthAccountId, AuthAccount, PrismaAuthAccount>
  implements IAuthAccountRepository
{
  constructor(prisma: PrismaService, mapper: AuthAccountMapper) {
    super(prisma, mapper);
  }

  protected get delegate() {
    return this.prisma.authAccount;
  }

  async findByUserId(userId: string): Promise<AuthAccount | null> {
    const record = await this.delegate.findFirst({
      where: { userId },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }
}
