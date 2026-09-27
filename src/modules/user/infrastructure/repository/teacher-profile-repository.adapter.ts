import { Injectable } from '@nestjs/common';
import { TeacherProfileId, UserId } from '../../domain/value-objects';
import { IParentProfileRepository, TeacherProfile } from '../../domain';
import { TeacherProfileMapper } from '../mappers/teacher-profile.mappers';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { TeacherProfile as PrismaTeacherProfile } from '@generated/prisma/client';
import { ITeacherProfileRepository } from '../../domain/repository/teacher-profile.repository';

@Injectable()
export class PrismaTeacherProfileRepository
  extends PrismaBaseRepository<TeacherProfileId, TeacherProfile, PrismaTeacherProfile>
  implements ITeacherProfileRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly teacherProfileMapper: TeacherProfileMapper,
  ) {
    super(prisma, teacherProfileMapper);
  }

  protected get delegate() {
    return this.prisma.teacherProfile;
  }

  public async findByUserId(userId: UserId | string): Promise<TeacherProfile | null> {
    const record = await this.delegate.findUnique({
      where: { userId: String(userId) },
    });
    if (!record) return null;

    return this.mapper.toDomain(record);
  }
}
