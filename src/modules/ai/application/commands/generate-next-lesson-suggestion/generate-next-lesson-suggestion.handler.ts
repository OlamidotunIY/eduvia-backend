import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GenerateNextLessonSuggestionCommand } from './generate-next-lesson-suggestion.command';
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

@CommandHandler(GenerateNextLessonSuggestionCommand)
export class GenerateNextLessonSuggestionHandler
  implements ICommandHandler<GenerateNextLessonSuggestionCommand, AiJobDto>
{
  private readonly logger = new Logger(GenerateNextLessonSuggestionHandler.name);

  constructor(
    private readonly jobRepository: IAiJobRepository,
    private readonly promptTemplateRepository: IAiPromptTemplateRepository,
    private readonly aiProviderFactory: IAiProviderFactory,
  ) {}

  public async execute(
    command: GenerateNextLessonSuggestionCommand,
  ): Promise<AiJobDto> {
    const { params } = command;
    const provider = params.provider ?? AiProvider.GEMINI;
    const model =
      params.model ?? (provider === AiProvider.GEMINI ? 'gemini-2.0-flash' : 'gpt-4o');

    // 1. Check for active job
    const activeJob = await this.jobRepository.findActiveJob(
      AiJobType.NEXT_LESSON_SUGGESTION,
      params.student.id,
    );
    if (activeJob) {
      throw new ActiveAiJobConflictError(
        AiJobType.NEXT_LESSON_SUGGESTION,
        params.student.id,
      );
    }

    // 2. Fetch prompt template
    const template = await this.promptTemplateRepository.findActiveByType(
      AiJobType.NEXT_LESSON_SUGGESTION,
    );
    const promptVersion = template ? template.version : 'v1.0-default';

    const inputPayload = {
      student: params.student,
      curriculum: params.curriculum,
      subject: params.subject,
      masteryGraph: params.masteryGraph,
      recentLessons: params.recentLessons ?? [],
    };

    // 3. Create job
    const job = AiJob.create({
      type: AiJobType.NEXT_LESSON_SUGGESTION,
      inputPayload,
      provider,
      model,
      promptVersion,
      relatedEntityId: params.student.id,
      relatedEntityType: AiEntityType.STUDENT,
      orgId: params.orgId,
      requestedBy: params.requestedBy ?? null,
      correlationId: params.correlationId,
    });

    job.markProcessing();
    await this.jobRepository.save(job);

    try {
      // 4. Generate suggestion
      const systemPrompt = template
        ? template.systemPrompt
        : 'You are an educational curriculum recommendation engine. Analyze the student mastery graph and recommend the next optimal topic.';

      const userPrompt = template
        ? template.renderUserPrompt(inputPayload)
        : `Analyze the student's mastery graph: ${JSON.stringify(params.masteryGraph)} and recent lessons: ${JSON.stringify(params.recentLessons ?? [])}. Recommend next lesson topic for subject "${params.subject}". Return JSON with { "suggestion": { "curriculumNodeId", "nodeName", "rationale", "prerequisitesMet": true, "recommendedQuestions": [] }, "alternativeSuggestions": [] }`;

      const aiPort = this.aiProviderFactory.getProvider(provider);
      const aiResponse = await aiPort.generateText({
        prompt: userPrompt,
        systemPrompt,
        model,
        temperature: 0.1,
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
          suggestion: {
            rationale: aiResponse.text,
          },
        };
      }

      job.complete(parsedOutput, aiResponse.tokensUsed, params.correlationId);
      await this.jobRepository.save(job);
    } catch (err: any) {
      this.logger.error(
        `AI Next-lesson suggestion failed: ${err.message}`,
        err.stack,
      );
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
