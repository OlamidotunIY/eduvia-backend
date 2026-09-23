import { Injectable } from '@nestjs/common';
import { IStudentProfileRepository, StudentProfile } from '../../domain';
import { StudentProfileId } from '../../domain/value-objects';
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { StudentProfileMapper } from '../mappers';
import { StudentProfile as PrismaStudentProfile } from '@generated/prisma/client';
import { ParentProfileId } from '../../domain/value-objects';

@Injectable()
export class PrismaStudentProfileRepository
  extends PrismaBaseRepository<StudentProfileId, StudentProfile, PrismaStudentProfile>
  implements IStudentProfileRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly studentProfileMapper: StudentProfileMapper,
  ) {
    super(prisma, studentProfileMapper);
  }

  protected get delegate() {
    return this.prisma.studentProfile;
  }

  public async findByParentId(parentId: ParentProfileId | string): Promise<StudentProfile[]> {
    const records = await this.delegate.findMany({
      where: { parentId: String(parentId) },
    });
    return records.map((r) => this.mapper.toDomain(r));
  }
}
