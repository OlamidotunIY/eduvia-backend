import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Classroom,
  ClassroomId,
  IClassroomRepository,
} from '../../../domain';
import { Classroom as PrismaClassroom } from '@generated/prisma/client';
import { ClassroomMapper } from '../mappers/classroom.mapper';

@Injectable()
export class PrismaClassroomRepository
  extends PrismaBaseRepository<ClassroomId, Classroom, PrismaClassroom>
  implements IClassroomRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly classroomMapper: ClassroomMapper,
  ) {
    super(prisma, classroomMapper);
  }

  protected get delegate() {
    return this.prisma.classroom;
  }

  public async findByOrgId(orgId: string): Promise<Classroom[]> {
    const records = await this.delegate.findMany({
      where: { orgId },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByTeacherId(orgId: string, teacherId: string): Promise<Classroom[]> {
    const records = await this.delegate.findMany({
      where: { orgId, primaryTeacherId: teacherId },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }
}
