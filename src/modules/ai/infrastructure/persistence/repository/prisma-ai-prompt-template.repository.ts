import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  AiPromptTemplate,
  AiPromptTemplateId,
  AiJobType,
  IAiPromptTemplateRepository,
  PromptTemplateFilter,
} from '../../../domain';
import {
  AIPromptTemplate as PrismaAIPromptTemplate,
  Prisma,
} from '@generated/prisma/client';
import { AiPromptTemplateMapper } from '../mappers/ai-prompt-template.mapper';

@Injectable()
export class PrismaAiPromptTemplateRepository
  extends PrismaBaseRepository<
    AiPromptTemplateId,
    AiPromptTemplate,
    PrismaAIPromptTemplate
  >
  implements IAiPromptTemplateRepository
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly templateMapper: AiPromptTemplateMapper,
  ) {
    super(prisma, templateMapper);
  }

  protected get delegate() {
    return this.prisma.aIPromptTemplate;
  }

  public override async findById(
    id: AiPromptTemplateId | string,
  ): Promise<AiPromptTemplate | null> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    const record = await this.prisma.aIPromptTemplate.findUnique({
      where: { id: rawId },
    });
    return record ? this.templateMapper.toDomain(record) : null;
  }

  public override async findAll(): Promise<AiPromptTemplate[]> {
    const records = await this.prisma.aIPromptTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.templateMapper.toDomain(record));
  }

  public async findActiveByType(
    type: AiJobType,
  ): Promise<AiPromptTemplate | null> {
    const record = await this.prisma.aIPromptTemplate.findFirst({
      where: {
        type: type as any,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.templateMapper.toDomain(record) : null;
  }

  public async findByTypeAndVersion(
    type: AiJobType,
    version: string,
  ): Promise<AiPromptTemplate | null> {
    const record = await this.prisma.aIPromptTemplate.findUnique({
      where: {
        type_version: {
          type: type as any,
          version,
        },
      },
    });
    return record ? this.templateMapper.toDomain(record) : null;
  }

  public async findFiltered(
    filter?: PromptTemplateFilter,
  ): Promise<AiPromptTemplate[]> {
    const where: Prisma.AIPromptTemplateWhereInput = {};
    if (filter?.type) {
      where.type = filter.type as any;
    }
    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    const records = await this.prisma.aIPromptTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.templateMapper.toDomain(record));
  }

  public override async save(entity: AiPromptTemplate): Promise<void> {
    const data = this.templateMapper.toPersistence(entity);
    const templateId = entity.id.unpack();
    const events = entity.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      // If setting this template as active, deactivate other templates of the same type
      if (data.isActive) {
        await tx.aIPromptTemplate.updateMany({
          where: {
            type: data.type,
            isActive: true,
            id: { not: templateId },
          },
          data: {
            isActive: false,
            deprecatedAt: new Date(),
          },
        });
      }

      await tx.aIPromptTemplate.upsert({
        where: { id: templateId },
        create: {
          id: templateId,
          name: data.name,
          type: data.type,
          version: data.version,
          systemPrompt: data.systemPrompt,
          userPromptTemplate: data.userPromptTemplate,
          isActive: data.isActive,
          createdAt: data.createdAt,
          deprecatedAt: data.deprecatedAt,
          updatedAt: data.updatedAt,
        },
        update: {
          name: data.name,
          systemPrompt: data.systemPrompt,
          userPromptTemplate: data.userPromptTemplate,
          isActive: data.isActive,
          deprecatedAt: data.deprecatedAt,
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

  public override async delete(id: AiPromptTemplateId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.unpack();
    await this.prisma.aIPromptTemplate.delete({
      where: { id: rawId },
    });
  }
}
