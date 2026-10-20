import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  GenerateQuestionsCommand,
  GenerateNextLessonSuggestionCommand,
  CreatePromptTemplateCommand,
  UpdatePromptTemplateCommand,
  DeprecatePromptTemplateCommand,
  CancelAiJobCommand,
} from '../../application/commands';
import {
  GetAiJobByIdQuery,
  ListAiJobsByOrgQuery,
  ListPromptTemplatesQuery,
  GetAiCostSummaryQuery,
  AiJobDto,
  AiPromptTemplateDto,
  AiCostSummaryDto,
} from '../../application/queries';
import {
  GenerateQuestionsRequestDto,
  GenerateNextLessonSuggestionRequestDto,
  CreatePromptTemplateRequestDto,
  UpdatePromptTemplateRequestDto,
} from '../dto';
import { AiProvider, AiJobType, AiJobStatus } from '../../domain';

@Injectable()
export class AiService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  public async generateQuestions(
    orgId: string,
    requestedBy: string | undefined,
    dto: GenerateQuestionsRequestDto,
  ): Promise<AiJobDto> {
    return this.commandBus.execute(
      new GenerateQuestionsCommand({
        curriculumNode: dto.curriculumNode,
        curriculumProfile: dto.curriculumProfile,
        subject: dto.subject,
        questionType: dto.questionType,
        difficultyLevel: dto.difficultyLevel,
        count: dto.count,
        existingQuestions: dto.existingQuestions,
        orgId,
        requestedBy,
        provider: dto.provider as AiProvider,
        model: dto.model,
      }),
    );
  }

  public async generateNextLessonSuggestion(
    orgId: string,
    requestedBy: string | undefined,
    dto: GenerateNextLessonSuggestionRequestDto,
  ): Promise<AiJobDto> {
    return this.commandBus.execute(
      new GenerateNextLessonSuggestionCommand({
        student: dto.student,
        curriculum: dto.curriculum,
        subject: dto.subject,
        masteryGraph: dto.masteryGraph,
        recentLessons: dto.recentLessons,
        orgId,
        requestedBy,
        provider: dto.provider as AiProvider,
        model: dto.model,
      }),
    );
  }

  public async getJobById(jobId: string): Promise<AiJobDto> {
    return this.queryBus.execute(new GetAiJobByIdQuery(jobId));
  }

  public async listJobs(
    orgId: string,
    options?: {
      type?: AiJobType;
      status?: AiJobStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ jobs: AiJobDto[]; total: number }> {
    return this.queryBus.execute(new ListAiJobsByOrgQuery(orgId, options));
  }

  public async cancelJob(jobId: string): Promise<AiJobDto> {
    return this.commandBus.execute(new CancelAiJobCommand(jobId));
  }

  public async listPromptTemplates(filter?: {
    type?: AiJobType;
    isActive?: boolean;
  }): Promise<AiPromptTemplateDto[]> {
    return this.queryBus.execute(new ListPromptTemplatesQuery(filter));
  }

  public async createPromptTemplate(
    dto: CreatePromptTemplateRequestDto,
  ): Promise<AiPromptTemplateDto> {
    return this.commandBus.execute(
      new CreatePromptTemplateCommand({
        name: dto.name,
        type: dto.type,
        version: dto.version,
        systemPrompt: dto.systemPrompt,
        userPromptTemplate: dto.userPromptTemplate,
        isActive: dto.isActive,
      }),
    );
  }

  public async updatePromptTemplate(
    id: string,
    dto: UpdatePromptTemplateRequestDto,
  ): Promise<AiPromptTemplateDto> {
    return this.commandBus.execute(
      new UpdatePromptTemplateCommand({
        id,
        name: dto.name,
        systemPrompt: dto.systemPrompt,
        userPromptTemplate: dto.userPromptTemplate,
      }),
    );
  }

  public async deprecatePromptTemplate(
    id: string,
  ): Promise<AiPromptTemplateDto> {
    return this.commandBus.execute(new DeprecatePromptTemplateCommand(id));
  }

  public async getCostSummary(): Promise<AiCostSummaryDto[]> {
    return this.queryBus.execute(new GetAiCostSummaryQuery());
  }
}
