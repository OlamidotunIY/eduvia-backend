import { PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  StudentResponse,
  StudentResponseId,
  IStudentResponseRepository,
} from '../../../domain';
import { StudentResponseMapper } from '../mappers/student-response.mapper';

@Injectable()
export class PrismaStudentResponseRepository implements IStudentResponseRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: StudentResponseMapper,
  ) {}

  public async findById(id: StudentResponseId | string): Promise<StudentResponse | null> {
    const record = await this.prisma.studentResponse.findUnique({
      where: { id: String(id) },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async findAll(): Promise<StudentResponse[]> {
    const records = await this.prisma.studentResponse.findMany();
    return records.map((r) => this.mapper.toDomain(r));
  }

  public async findByBoardQuestionId(boardQuestionId: string): Promise<StudentResponse[]> {
    const records = await this.prisma.studentResponse.findMany({
      where: { boardQuestionId },
      orderBy: { submittedAt: 'desc' },
    });
    return records.map((r) => this.mapper.toDomain(r));
  }

  public async findByQuestionAndStudent(
    boardQuestionId: string,
    studentId: string,
  ): Promise<StudentResponse | null> {
    const record = await this.prisma.studentResponse.findUnique({
      where: {
        boardQuestionId_studentId: {
          boardQuestionId,
          studentId,
        },
      },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  public async save(entity: StudentResponse): Promise<void> {
    const data = this.mapper.toPersistence(entity);
    await this.prisma.studentResponse.upsert({
      where: { id: entity.id.unpack() },
      create: {
        id: entity.id.unpack(),
        ...data,
      },
      update: data,
    });
  }

  public async delete(id: StudentResponseId | string): Promise<void> {
    await this.prisma.studentResponse.delete({
      where: { id: String(id) },
    });
  }
}
