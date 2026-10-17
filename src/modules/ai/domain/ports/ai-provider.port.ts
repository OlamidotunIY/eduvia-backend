import { AiProvider } from '../value-objects';

export interface GenerateTextParams {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiGenerationResult {
  text: string;
  tokensUsed: number;
  model: string;
  provider: AiProvider;
}

export abstract class IAiProviderPort {
  public abstract generateText(
    params: GenerateTextParams,
  ): Promise<AiGenerationResult>;
}

export abstract class IAiProviderFactory {
  public abstract getProvider(provider: AiProvider): IAiProviderPort;
}
