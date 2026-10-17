import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GenerateQuestionsCommand } from './generate-questions.command';
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

@CommandHandler(GenerateQuestionsCommand)
export class GenerateQuestionsHandler
  implements ICommandHandler<GenerateQuestionsCommand, AiJobDto>
{
  private readonly logger = new Logger(GenerateQuestionsHandler.name);

  constructor(
    private readonly jobRepository: IAiJobRepository,
    private readonly promptTemplateRepository: IAiPromptTemplateRepository,
    private readonly aiProviderFactory: IAiProviderFactory,
  ) {}

  public async execute(command: GenerateQuestionsCommand): Promise<AiJobDto> {
    const { params } = command;
    const provider = params.provider ?? AiProvider.OPENAI;
    const model = params.model ?? (provider === AiProvider.OPENAI ? 'gpt-4o' : 'gemini-2.0-flash');

    // 1. Check for active job
    const activeJob = await this.jobRepository.findActiveJob(
      AiJobType.QUESTION_GENERATION,
      params.curriculumNode.id,
    );
    if (activeJob) {
      throw new ActiveAiJobConflictError(
        AiJobType.QUESTION_GENERATION,
        params.curriculumNode.id,
      );
    }

    // 2. Fetch active prompt template
    const template = await this.promptTemplateRepository.findActiveByType(
      AiJobType.QUESTION_GENERATION,
    );
    const promptVersion = template ? template.version : 'v1.0-default';

    const inputPayload = {
      curriculumNode: params.curriculumNode,
      curriculumProfile: params.curriculumProfile,
      subject: params.subject,
      questionType: params.questionType,
      difficultyLevel: params.difficultyLevel,
      count: params.count,
      existingQuestions: params.existingQuestions ?? [],
    };

    // 3. Create job
    const job = AiJob.create({
      type: AiJobType.QUESTION_GENERATION,
      inputPayload,
      provider,
      model,
      promptVersion,
      relatedEntityId: params.curriculumNode.id,
      relatedEntityType: AiEntityType.CURRICULUM_NODE,
      orgId: params.orgId,
      requestedBy: params.requestedBy ?? null,
      correlationId: params.correlationId,
    });

    job.markProcessing();
    await this.jobRepository.save(job);

    try {
      // 4. Generate questions via AI Provider
      const systemPrompt = template
        ? template.systemPrompt
        : 'You are an expert curriculum-aligned educational assessment specialist. Return JSON with key "questions" containing an array of generated questions.';

      const userPrompt = template
        ? template.renderUserPrompt(inputPayload)
        : `Generate ${params.count} questions for curriculum node "${params.curriculumNode.name}" (${params.curriculumNode.code}), subject "${params.subject}", difficulty level ${params.difficultyLevel}, question type "${params.questionType}". Return JSON: { "questions": [...] }`;

      const aiPort = this.aiProviderFactory.getProvider(provider);
      const aiResponse = await aiPort.generateText({
        prompt: userPrompt,
        systemPrompt,
        model,
        temperature: 0.2,
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
          questions: [],
          rawText: aiResponse.text,
        };
      }

      job.complete(parsedOutput, aiResponse.tokensUsed, params.correlationId);
      await this.jobRepository.save(job);
    } catch (err: any) {
      this.logger.error(`AI Question generation failed: ${err.message}`, err.stack);
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
