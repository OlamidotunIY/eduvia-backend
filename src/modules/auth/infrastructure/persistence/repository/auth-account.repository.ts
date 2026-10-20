import { Injectable } from '@nestjs/common';
import { Account as PrismaAuthAccount } from '@generated/prisma/client';
import { AuthAccountMapper } from '../mappers';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import {
  AuthAccount,
  AuthAccountId,
  IAuthAccountRepository,
} from '../../../domain';

@Injectable()
export class PrismaAuthAccountRepository
  extends PrismaBaseRepository<AuthAccountId, AuthAccount, PrismaAuthAccount>
  implements IAuthAccountRepository
{
  constructor(prisma: PrismaService, mapper: AuthAccountMapper) {
    super(prisma, mapper);
  }

  protected get delegate() {
    return this.prisma.account;
  }

  async findByUserId(userId: string): Promise<AuthAccount | null> {
    const record = await this.delegate.findFirst({
      where: { userId },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findCredentialsByUserId(userId: string): Promise<AuthAccount | null> {
    const record = await this.delegate.findFirst({
      where: { userId, providerId: 'credentials' },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }
}
