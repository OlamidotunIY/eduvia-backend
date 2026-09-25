import { Injectable } from '@nestjs/common';
import { TeacherProfileId, UserId } from '../../domain/value-objects';
import { IParentProfileRepository, TeacherProfile } from '../../domain';
import { TeacherProfileMapper } from '../mappers/teacher-profile.mappers';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { TeacherProfile as PrismaTeacherProfile } from '@generated/prisma/client';

@Injectable()
export class PrismaTeacherProfileRepository
  extends PrismaBaseRepository<TeacherProfileId, TeacherProfile, PrismaTeacherProfile>
  implements IParentProfileRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly parentProfileMapper: TeacherProfileMapper,
  ) {
    super(prisma, parentProfileMapper);
  }

  protected get delegate() {
    return this.prisma.TeacherProfile;
  }

  public async findByUserId(userId: UserId | string): Promise<TeacherProfile | null> {
    const record = await this.delegate.findUnique({
      where: { userId: String(userId) },
    });
    if (!record) return null;

    return this.mapper.toDomain(record);
  }
}
