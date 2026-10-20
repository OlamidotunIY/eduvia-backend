import { AiQueryAdapter } from '../infrastructure/services/ai-query.adapter';
import {
  AiJob,
  AiJobType,
  AiProvider,
  AiEntityType,
  AiPromptTemplate,
} from '../domain';

describe('AiQueryAdapter', () => {
  let adapter: AiQueryAdapter;
  let mockJobRepo: any;
  let mockTemplateRepo: any;

  beforeEach(() => {
    mockJobRepo = {
      findById: jest.fn(),
      findLatestCompleted: jest.fn(),
    };

    mockTemplateRepo = {
      findActiveByType: jest.fn(),
    };

    adapter = new AiQueryAdapter(mockJobRepo, mockTemplateRepo);
  });

  it('should return shared job DTO by ID', async () => {
    const job = AiJob.create({
      type: AiJobType.REPORT_SUMMARY,
      inputPayload: { lessonId: 'l-1' },
      provider: AiProvider.OPENAI,
      model: 'gpt-4o',
      promptVersion: 'v1',
      relatedEntityId: 'l-1',
      relatedEntityType: AiEntityType.LESSON,
      orgId: 'org-1',
    });
    mockJobRepo.findById.mockResolvedValue(job);

    const result = await adapter.getJobById(job.id.unpack());

    expect(result).not.toBeNull();
    expect(result!.id).toBe(job.id.unpack());
    expect(result!.type).toBe(AiJobType.REPORT_SUMMARY);
  });

  it('should return null when job is not found', async () => {
    mockJobRepo.findById.mockResolvedValue(null);

    const result = await adapter.getJobById('non-existent');
    expect(result).toBeNull();
  });

  it('should return latest completed job', async () => {
    const job = AiJob.create({
      type: AiJobType.REPORT_SUMMARY,
      inputPayload: { lessonId: 'l-1' },
      provider: AiProvider.OPENAI,
      model: 'gpt-4o',
      promptVersion: 'v1',
      relatedEntityId: 'l-1',
      relatedEntityType: AiEntityType.LESSON,
      orgId: 'org-1',
    });
    job.markProcessing();
    job.complete({ summary: 'Well done' }, 50);
    mockJobRepo.findLatestCompleted.mockResolvedValue(job);

    const result = await adapter.getLatestCompletedJob(
      AiJobType.REPORT_SUMMARY,
      'l-1',
    );

    expect(result).not.toBeNull();
    expect(result!.outputPayload).toEqual({ summary: 'Well done' });
    expect(result!.tokensUsed).toBe(50);
  });

  it('should return active prompt template DTO', async () => {
    const template = AiPromptTemplate.create({
      name: 'Summary Template',
      type: AiJobType.REPORT_SUMMARY,
      version: 'v1.0',
      systemPrompt: 'sys',
      userPromptTemplate: 'usr',
    });
    mockTemplateRepo.findActiveByType.mockResolvedValue(template);

    const result = await adapter.getActivePromptTemplate(AiJobType.REPORT_SUMMARY);

    expect(result).not.toBeNull();
    expect(result!.name).toBe('Summary Template');
    expect(result!.version).toBe('v1.0');
  });
});
