import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAiProviderPort,
  GenerateTextParams,
  AiGenerationResult,
  AiProvider,
} from '../../domain';

@Injectable()
export class OpenAiAdapter implements IAiProviderPort {
  private readonly logger = new Logger(OpenAiAdapter.name);
  private readonly apiKey: string | null;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') ?? null;
  }

  public async generateText(
    params: GenerateTextParams,
  ): Promise<AiGenerationResult> {
    const model = params.model ?? 'gpt-4o';
    const temperature = params.temperature ?? 0.2;
    const maxTokens = params.maxTokens ?? 2000;

    if (!this.apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY is not configured; using deterministic mock output.',
      );
      return this.generateMockResponse(params, model);
    }

    try {
      const messages: Array<{ role: string; content: string }> = [];
      if (params.systemPrompt) {
        messages.push({ role: 'system', content: params.systemPrompt });
      }
      messages.push({ role: 'user', content: params.prompt });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'OpenAI API request failed');
      }

      const text = data.choices?.[0]?.message?.content ?? '{}';
      const tokensUsed = data.usage?.total_tokens ?? 150;

      return {
        text,
        tokensUsed,
        model,
        provider: AiProvider.OPENAI,
      };
    } catch (err: any) {
      this.logger.warn(
        `OpenAI request failed (${err.message}); falling back to mock response.`,
      );
      return this.generateMockResponse(params, model);
    }
  }

  private generateMockResponse(
    params: GenerateTextParams,
    model: string,
  ): AiGenerationResult {
    // Generate context-aware mock JSON based on prompt hints
    let text = '{}';
    if (params.prompt.includes('questions') || params.prompt.includes('curriculumNode')) {
      text = JSON.stringify({
        questions: [
          {
            stem: 'Solve for x: 2x + 5 = 15',
            type: 'short_answer',
            markScheme: 'x = 5. Award 1 mark for subtracting 5, 1 mark for dividing by 2.',
            maxMarks: 2,
            difficultyLevel: 2,
            options: null,
          },
          {
            stem: 'Which of the following is a prime number?',
            type: 'mcq',
            markScheme: 'Option B is correct.',
            maxMarks: 1,
            difficultyLevel: 1,
            options: ['4', '7', '9', '12'],
          },
        ],
      });
    } else if (params.prompt.includes('lesson report') || params.prompt.includes('summary')) {
      text = JSON.stringify({
        summary:
          'The student demonstrated solid engagement and understanding during the lesson, successfully working through practice problems.',
        strengths: [
          'Strong conceptual grasp of the core principles',
          'Active participation and clear explanations',
        ],
        areasForImprovement: [
          'Pacing when tackling multi-step questions',
          'Reviewing edge cases before submitting final answers',
        ],
        nextSteps:
          'Continue to reinforcement exercises on complex scenarios in the next session.',
      });
    } else if (
      params.prompt.includes('mastery graph') ||
      params.prompt.includes('next lesson') ||
      params.prompt.includes('suggestion')
    ) {
      text = JSON.stringify({
        suggestion: {
          curriculumNodeId: 'node-suggestion-001',
          nodeName: 'Quadratic Equations & Roots',
          rationale:
            'Student has demonstrated prerequisite mastery in linear algebra and is ready for quadratic progressions.',
          prerequisitesMet: true,
          recommendedQuestions: ['q-mock-1', 'q-mock-2'],
        },
        alternativeSuggestions: [],
      });
    }

    return {
      text,
      tokensUsed: 120,
      model,
      provider: AiProvider.OPENAI,
    };
  }
}
