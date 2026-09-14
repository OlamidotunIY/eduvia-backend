import { Injectable } from '@nestjs/common';
import { AuthAccount as PrismaAuthAccount } from '@prisma/client';
import { AuthAccount } from '../../domain/model/AuthAccount';
import { IAuthAccountRepository } from '../../domain/repository/auth-account.repository';
import { PrismaBaseRepository } from '../../../../shared/repository/prisma-base.repository';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { AuthAccountMapper } from '../mappers/auth-account.mapper';

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
}
