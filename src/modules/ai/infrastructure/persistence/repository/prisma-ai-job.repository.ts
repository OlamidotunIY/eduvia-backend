import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  AiJob,
  AiJobId,
  AiJobType,
  AiJobStatus,
  IAiJobRepository,
  FindAiJobsByOrgOptions,
  AiCostSummary,
} from '../../../domain';
import {
  AIJob as PrismaAIJob,
  Prisma,
} from '@generated/prisma/client';
import { AiJobMapper } from '../mappers/ai-job.mapper';

@Injectable()
export class PrismaAiJobRepository
  extends PrismaBaseRepository<AiJobId, AiJob, PrismaAIJob>
  implements IAiJobRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly jobMapper: AiJobMapper,
  ) {
    super(prisma, jobMapper);
  }

  protected get delegate() {
    return this.prisma.aIJob;
  }

  public override async findById(
    id: AiJobId | string,
  ): Promise<AiJob | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.aIJob.findUnique({
      where: { id: rawId },
    });
    return record ? this.jobMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<AiJob[]> {
    const records = await this.prisma.aIJob.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.jobMapper.toDomain(record));
  }

  public async findActiveJob(
    type: AiJobType,
    relatedEntityId: string,
  ): Promise<AiJob | null> {
    const record = await this.prisma.aIJob.findFirst({
      where: {
        type: type as any,
        relatedEntityId,
        status: {
          in: [AiJobStatus.QUEUED as any, AiJobStatus.PROCESSING as any],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.jobMapper.toDomain(record) : null;
  }

  public async findByOrg(
    orgId: string,
    options?: FindAiJobsByOrgOptions,
  ): Promise<AiJob[]> {
    const where: Prisma.AIJobWhereInput = { orgId };
    if (options?.type) {
      where.type = options.type as any;
    }
    if (options?.status) {
      where.status = options.status as any;
    }

    const records = await this.prisma.aIJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
    return records.map((record) => this.jobMapper.toDomain(record));
  }

  public async countByOrg(
    orgId: string,
    options?: { type?: AiJobType; status?: AiJobStatus },
  ): Promise<number> {
    const where: Prisma.AIJobWhereInput = { orgId };
    if (options?.type) {
      where.type = options.type as any;
    }
    if (options?.status) {
      where.status = options.status as any;
    }

    return this.prisma.aIJob.count({ where });
  }

  public async getCostSummaryByOrg(): Promise<AiCostSummary[]> {
    const grouped = await this.prisma.aIJob.groupBy({
      by: ['orgId'],
      _sum: {
        tokensUsed: true,
      },
      _count: {
        id: true,
      },
    });

    return grouped.map((g) => ({
      orgId: g.orgId,
      totalTokens: g._sum.tokensUsed ?? 0,
      totalJobs: g._count.id,
    }));
  }

  public async findLatestCompleted(
    type: AiJobType,
    relatedEntityId: string,
  ): Promise<AiJob | null> {
    const record = await this.prisma.aIJob.findFirst({
      where: {
        type: type as any,
        relatedEntityId,
        status: AiJobStatus.COMPLETED as any,
      },
      orderBy: { completedAt: 'desc' },
    });
    return record ? this.jobMapper.toDomain(record) : null;
  }

  public override async save(entity: AiJob): Promise<void> {
    const data = this.jobMapper.toPersistence(entity);
    const jobId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.aIJob.upsert({
        where: { id: jobId },
        create: {
          id: jobId,
          type: data.type,
          status: data.status,
          inputPayload: data.inputPayload as Prisma.InputJsonValue,
          outputPayload: data.outputPayload
            ? (data.outputPayload as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          provider: data.provider,
          model: data.model,
          promptVersion: data.promptVersion,
          tokensUsed: data.tokensUsed,
          errorMessage: data.errorMessage,
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          orgId: data.orgId,
          requestedBy: data.requestedBy,
          createdAt: data.createdAt,
          completedAt: data.completedAt,
          updatedAt: data.updatedAt,
        },
        update: {
          type: data.type,
          status: data.status,
          inputPayload: data.inputPayload as Prisma.InputJsonValue,
          outputPayload: data.outputPayload
            ? (data.outputPayload as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          provider: data.provider,
          model: data.model,
          promptVersion: data.promptVersion,
          tokensUsed: data.tokensUsed,
          errorMessage: data.errorMessage,
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          orgId: data.orgId,
          requestedBy: data.requestedBy,
          completedAt: data.completedAt,
          updatedAt: data.updatedAt,
        },
      });

      for (const event of events) {
        await tx.outboxMessage.create({
          data: {
            id:
              typeof event.eventId === 'string'
                ? event.eventId
                : String(event.eventId),
            eventId: event.eventId,
            type: event.eventName,
            aggregateType: entity.constructor.name,
            aggregateId: entity.getId(),
            payload: event.payload as object,
            correlationId: event.correlationId,
            occurredAt: event.occurredAt,
            status: 'PENDING' as any,
          },
        });
      }
    });
  }

  public override async delete(id: AiJobId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.aIJob.delete({
      where: { id: rawId },
    });
  }
}
