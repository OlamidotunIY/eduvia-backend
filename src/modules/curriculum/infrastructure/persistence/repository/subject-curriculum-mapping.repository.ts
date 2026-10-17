import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  SubjectCurriculumMapping,
  SubjectCurriculumMappingId,
  ISubjectCurriculumMappingRepository,
} from '../../../domain';
import { SubjectCurriculumMappingMapper } from '../mappers';

@Injectable()
export class PrismaSubjectCurriculumMappingRepository implements ISubjectCurriculumMappingRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: SubjectCurriculumMappingMapper,
  ) {}

  public async findById(id: SubjectCurriculumMappingId | string): Promise<SubjectCurriculumMapping | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.subjectCurriculumMapping.findUnique({
      where: { id: rawId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<SubjectCurriculumMapping[]> {
    const records = await this.prisma.subjectCurriculumMapping.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findBySubjectAndCurriculum(
    platformSubjectId: string,
    curriculumId: string,
  ): Promise<SubjectCurriculumMapping | null> {
    const record = await this.prisma.subjectCurriculumMapping.findUnique({
      where: {
        platformSubjectId_curriculumId: {
          platformSubjectId,
          curriculumId,
        },
      },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findByCurriculumId(curriculumId: string): Promise<SubjectCurriculumMapping[]> {
    const records = await this.prisma.subjectCurriculumMapping.findMany({
      where: { curriculumId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async findByPlatformSubjectId(platformSubjectId: string): Promise<SubjectCurriculumMapping[]> {
    const records = await this.prisma.subjectCurriculumMapping.findMany({
      where: { platformSubjectId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  public async save(entity: SubjectCurriculumMapping): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    const id = entity.id.unpack();

    await this.prisma.subjectCurriculumMapping.upsert({
      where: { id },
      create: {
        id,
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: SubjectCurriculumMappingId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.subjectCurriculumMapping.delete({
      where: { id: rawId },
    });
  }
}
