import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { OrganizationId, TeacherApplicationId } from '../../domain';
import { ITeacherApplicationRepository } from '../../domain/repository/teacher-application.repository';
import { TeacherApplication as PrismaTeacherApplication } from '@generated/prisma/client';
import { TeacherApplicationMapper } from '../mappers/teacher-application.mapper';
import { TeacherApplication } from '../../domain/entities';

@Injectable()
export class PrismaTeacherApplicationRepository
  extends PrismaBaseRepository<
    TeacherApplicationId,
    TeacherApplication,
    PrismaTeacherApplication
  >
  implements ITeacherApplicationRepository
{
  constructor(
    prisma: PrismaService,
    teacherApplicationMapper: TeacherApplicationMapper,
  ) {
    super(prisma, teacherApplicationMapper);
  }

  protected get delegate() {
    return this.prisma.teacherApplication;
  }

  public async findByOrganizationId(
    orgId: OrganizationId |string,
  ): Promise<TeacherApplication[]> {
    const records = await this.delegate.findMany({
      where: {
        orgId: String(orgId),
      },
    });

    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByApplicantUserId(
    applicantUserId: string,
  ): Promise<TeacherApplication | null> {
    const record = await this.delegate.findFirst({
      where: {
        applicantUserId,
      },
    });

    if (!record) {
      return null;
    }

    return this.mapper.toDomain(record);
  }
}
