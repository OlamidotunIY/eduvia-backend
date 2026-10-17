import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GenerateReportSummaryCommand } from './generate-report-summary.command';
import {
  AiJob,
  AiJobType,
  AiProvider,
  AiEntityType,
  IAiJobRepository,
  IAiPromptTemplateRepository,
  IAiProviderFactory,
  ActiveAiJobConflictError,
} from '../../../domain';
import { AiJobDto } from '../../queries/dto/ai-job.dto';

@CommandHandler(GenerateReportSummaryCommand)
export class GenerateReportSummaryHandler
  implements ICommandHandler<GenerateReportSummaryCommand, AiJobDto>
{
  private readonly logger = new Logger(GenerateReportSummaryHandler.name);

  constructor(
    private readonly jobRepository: IAiJobRepository,
    private readonly promptTemplateRepository: IAiPromptTemplateRepository,
    private readonly aiProviderFactory: IAiProviderFactory,
  ) {}

  public async execute(command: GenerateReportSummaryCommand): Promise<AiJobDto> {
    const { params } = command;
    const provider = params.provider ?? AiProvider.OPENAI;
    const model =
      params.model ?? (provider === AiProvider.OPENAI ? 'gpt-4o' : 'gemini-2.0-flash');

    // 1. Check active job
    const activeJob = await this.jobRepository.findActiveJob(
      AiJobType.REPORT_SUMMARY,
      params.lessonId,
    );
    if (activeJob) {
      throw new ActiveAiJobConflictError(
        AiJobType.REPORT_SUMMARY,
        params.lessonId,
      );
    }

    // 2. Fetch template
    const template = await this.promptTemplateRepository.findActiveByType(
      AiJobType.REPORT_SUMMARY,
    );
    const promptVersion = template ? template.version : 'v1.0-default';

    const inputPayload = {
      lesson: params.lesson,
      boardSections: params.boardSections,
      assessmentSummary: params.assessmentSummary,
      studentName: params.studentName,
      teacherName: params.teacherName,
      previousReportSummary: params.previousReportSummary ?? null,
    };

    // 3. Create job
    const job = AiJob.create({
      type: AiJobType.REPORT_SUMMARY,
      inputPayload,
      provider,
      model,
      promptVersion,
      relatedEntityId: params.lessonId,
      relatedEntityType: AiEntityType.LESSON,
      orgId: params.orgId,
      requestedBy: params.requestedBy ?? null,
      correlationId: params.correlationId,
    });

    job.markProcessing();
    await this.jobRepository.save(job);

    try {
      // 4. Generate report summary
      const systemPrompt = template
        ? template.systemPrompt
        : 'You are an empathetic, constructive educational reporting assistant. Generate parent-friendly lesson reports highlighting strengths, areas for improvement, and next steps.';

      const userPrompt = template
        ? template.renderUserPrompt(inputPayload)
        : `Generate a lesson report draft for student "${params.studentName}" taught by "${params.teacherName}". Lesson details: ${JSON.stringify(params.lesson)}. Assessment summary: ${JSON.stringify(params.assessmentSummary)}. Board sections: ${JSON.stringify(params.boardSections)}. Return JSON with { "summary": "...", "strengths": ["..."], "areasForImprovement": ["..."], "nextSteps": "..." }`;

      const aiPort = this.aiProviderFactory.getProvider(provider);
      const aiResponse = await aiPort.generateText({
        prompt: userPrompt,
        systemPrompt,
        model,
        temperature: 0.3,
      });

      // 5. Parse output
      let parsedOutput: Record<string, any>;
      try {
        let cleaned = aiResponse.text.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        parsedOutput = JSON.parse(cleaned);
      } catch {
        parsedOutput = {
          summary: aiResponse.text,
          strengths: [],
          areasForImprovement: [],
          nextSteps: '',
        };
      }

      job.complete(parsedOutput, aiResponse.tokensUsed, params.correlationId);
      await this.jobRepository.save(job);
    } catch (err: any) {
      this.logger.error(`AI Report summary generation failed: ${err.message}`, err.stack);
      job.fail(err.message, params.correlationId);
      await this.jobRepository.save(job);
      throw err;
    }

    return {
      id: job.id.unpack(),
      type: job.type,
      status: job.status,
      inputPayload: job.inputPayload,
      outputPayload: job.outputPayload,
      provider: job.provider,
      model: job.model,
      promptVersion: job.promptVersion,
      tokensUsed: job.tokensUsed,
      errorMessage: job.errorMessage,
      relatedEntityId: job.relatedEntityId,
      relatedEntityType: job.relatedEntityType,
      orgId: job.orgId,
      requestedBy: job.requestedBy,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      updatedAt: job.updatedAt,
    };
  }
}
