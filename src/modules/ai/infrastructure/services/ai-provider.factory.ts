import { Injectable } from '@nestjs/common';
import {
  IAiProviderFactory,
  IAiProviderPort,
  AiProvider,
} from '../../domain';
import { OpenAiAdapter } from './openai.adapter';
import { GeminiAdapter } from './gemini.adapter';

@Injectable()
export class AiProviderFactory implements IAiProviderFactory {
  constructor(
    private readonly openAiAdapter: OpenAiAdapter,
    private readonly geminiAdapter: GeminiAdapter,
  ) {}

  public getProvider(provider: AiProvider): IAiProviderPort {
    switch (provider) {
      case AiProvider.OPENAI:
        return this.openAiAdapter;
      case AiProvider.GEMINI:
        return this.geminiAdapter;
      default:
        return this.openAiAdapter;
    }
  }
}
