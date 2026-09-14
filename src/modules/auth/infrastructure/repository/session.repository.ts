import { Injectable } from '@nestjs/common';
import { Session as PrismaSession } from '@prisma/client';
import { Session } from '../../domain/model/Session';
import { ISessionRepository } from '../../domain/repository/session.repository';
import { PrismaBaseRepository } from '../../../../shared/repository/prisma-base.repository';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { SessionMapper } from '../mappers/session.mapper';

@Injectable()
export class PrismaSessionRepository
  extends PrismaBaseRepository<Session, PrismaSession>
  implements ISessionRepository
{
  constructor(prisma: PrismaService, mapper: SessionMapper) {
    super(prisma, mapper);
  }

  protected get delegate() {
    return this.prisma.session;
  }

  async findByUserId(userId: number): Promise<Session[]> {
    const records = await this.prisma.session.findMany({
      where: { authAccount: { userId } },
    });
    return records.map((r) => this.mapper.toDomain(r));
  }
}
