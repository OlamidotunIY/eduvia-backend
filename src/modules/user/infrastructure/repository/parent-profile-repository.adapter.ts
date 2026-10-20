import { Injectable } from '@nestjs/common';
import { IParentProfileRepository, ParentProfile } from '../../domain';
import { ParentProfileId } from '../../domain/value-objects';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { ParentProfileMapper } from '../mappers';
import { ParentProfile as PrismaParentProfile } from '@generated/prisma/client';
import { UserId } from '../../domain/value-objects';

@Injectable()
export class PrismaParentProfileRepository
  extends PrismaBaseRepository<ParentProfileId, ParentProfile, PrismaParentProfile>
  implements IParentProfileRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly parentProfileMapper: ParentProfileMapper,
  ) {
    super(prisma, parentProfileMapper);
  }

  protected get delegate() {
    return this.prisma.parentProfile;
  }

  public async findByUserId(userId: UserId | string): Promise<ParentProfile | null> {
    const record = await this.delegate.findUnique({
      where: { userId: String(userId) },
    });
    if (!record) return null;

    return this.mapper.toDomain(record);
  }
}
