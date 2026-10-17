import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAiProviderPort,
  GenerateTextParams,
  AiGenerationResult,
  AiProvider,
} from '../../domain';

@Injectable()
export class GeminiAdapter implements IAiProviderPort {
  private readonly logger = new Logger(GeminiAdapter.name);
  private readonly apiKey: string | null;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') ?? null;
  }

  public async generateText(
    params: GenerateTextParams,
  ): Promise<AiGenerationResult> {
    const model = params.model ?? 'gemini-2.0-flash';
    const temperature = params.temperature ?? 0.2;
    const maxTokens = params.maxTokens ?? 2000;

    if (!this.apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not configured; using deterministic mock output.',
      );
      return this.generateMockResponse(params, model);
    }

    try {
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      const userText = params.systemPrompt
        ? `${params.systemPrompt}\n\n${params.prompt}`
        : params.prompt;

      contents.push({
        role: 'user',
        parts: [{ text: userText }],
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json',
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Gemini API request failed');
      }

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
      const tokensUsed = data.usageMetadata?.totalTokenCount ?? 160;

      return {
        text,
        tokensUsed,
        model,
        provider: AiProvider.GEMINI,
      };
    } catch (err: any) {
      this.logger.warn(
        `Gemini request failed (${err.message}); falling back to mock response.`,
      );
      return this.generateMockResponse(params, model);
    }
  }

  private generateMockResponse(
    params: GenerateTextParams,
    model: string,
  ): AiGenerationResult {
    let text = '{}';
    if (params.prompt.includes('questions') || params.prompt.includes('curriculumNode')) {
      text = JSON.stringify({
        questions: [
          {
            stem: 'Factorize completely: x² - 9',
            type: 'short_answer',
            markScheme: '(x - 3)(x + 3). Award 1 mark for difference of two squares method.',
            maxMarks: 1,
            difficultyLevel: 2,
            options: null,
          },
        ],
      });
    } else if (params.prompt.includes('lesson report') || params.prompt.includes('summary')) {
      text = JSON.stringify({
        summary:
          'Excellent progression on core concepts today. Student engaged well with practice problems.',
        strengths: ['Great retention of definitions', 'Consistent computational accuracy'],
        areasForImprovement: ['Self-checking multi-step calculations'],
        nextSteps: 'Advance to mixed difficulty practice exercises.',
      });
    } else if (
      params.prompt.includes('mastery graph') ||
      params.prompt.includes('next lesson') ||
      params.prompt.includes('suggestion')
    ) {
      text = JSON.stringify({
        suggestion: {
          curriculumNodeId: 'node-suggestion-002',
          nodeName: 'Simultaneous Linear Equations',
          rationale:
            'High mastery in single-variable linear equations enables smooth transition to two variables.',
          prerequisitesMet: true,
          recommendedQuestions: ['q-gemini-1'],
        },
        alternativeSuggestions: [],
      });
    }

    return {
      text,
      tokensUsed: 135,
      model,
      provider: AiProvider.GEMINI,
    };
  }
}
