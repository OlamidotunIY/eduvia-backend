import { Injectable } from '@nestjs/common';
import { PrismaService } from '@modules/shared';
import { IStudentProfileRepository, StudentProfile } from '../../domain';
import { StudentProfileId } from '../../domain/value-objects';
import { StudentProfileMapper } from '../mappers';

@Injectable()
export class PrismaStudentProfileRepository implements IStudentProfileRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: StudentProfileMapper,
  ) {}

  async findById(id: StudentProfileId | string): Promise<StudentProfile | null> {
    const record = await this.prisma.studentProfile.findUnique({
      where: { id: String(id) },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findAll(): Promise<StudentProfile[]> {
    const records = await this.prisma.studentProfile.findMany();
    return records.map((record) => this.mapper.toDomain(record));
  }

  async save(entity: StudentProfile): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    await this.prisma.studentProfile.upsert({
      where: { id: entity.id.value },
      create: { id: entity.id.value, ...data },
      update: data,
    });
  }

  async delete(id: StudentProfileId | string): Promise<void> {
    await this.prisma.studentProfile.delete({ where: { id: String(id) } });
  }
}
