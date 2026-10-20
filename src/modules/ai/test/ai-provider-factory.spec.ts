import { AiProviderFactory } from '../infrastructure/services/ai-provider.factory';
import { OpenAiAdapter } from '../infrastructure/services/openai.adapter';
import { GeminiAdapter } from '../infrastructure/services/gemini.adapter';
import { AiProvider } from '../domain';

describe('AiProviderFactory', () => {
  let factory: AiProviderFactory;
  let mockOpenAi: OpenAiAdapter;
  let mockGemini: GeminiAdapter;

  beforeEach(() => {
    mockOpenAi = {
      generateText: jest.fn(),
    } as unknown as OpenAiAdapter;

    mockGemini = {
      generateText: jest.fn(),
    } as unknown as GeminiAdapter;

    factory = new AiProviderFactory(mockOpenAi, mockGemini);
  });

  it('should return OpenAiAdapter for AiProvider.OPENAI', () => {
    const provider = factory.getProvider(AiProvider.OPENAI);
    expect(provider).toBe(mockOpenAi);
  });

  it('should return GeminiAdapter for AiProvider.GEMINI', () => {
    const provider = factory.getProvider(AiProvider.GEMINI);
    expect(provider).toBe(mockGemini);
  });
});
