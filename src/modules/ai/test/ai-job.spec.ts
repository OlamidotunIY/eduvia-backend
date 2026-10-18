import {
  AiJob,
  AiJobType,
  AiJobStatus,
  AiProvider,
  AiEntityType,
  InvalidAiJobStateError,
  AIJobCreatedEvent,
  AIJobCompletedEvent,
  AIJobFailedEvent,
} from '../domain';

describe('AiJob Aggregate Root', () => {
  const sampleParams = {
    type: AiJobType.QUESTION_GENERATION,
    inputPayload: { subject: 'Mathematics', topic: 'Algebra' },
    provider: AiProvider.OPENAI,
    model: 'gpt-4o',
    promptVersion: 'v1.0',
    relatedEntityId: '0192a000-0000-7000-a000-000000000001',
    relatedEntityType: AiEntityType.CURRICULUM_NODE,
    orgId: '0192a000-0000-7000-a000-000000000002',
    requestedBy: '0192a000-0000-7000-a000-000000000003',
  };

  it('should create an AI job in QUEUED status and emit AIJobCreatedEvent', () => {
    const job = AiJob.create(sampleParams);

    expect(job.status).toBe(AiJobStatus.QUEUED);
    expect(job.isQueued()).toBe(true);
    expect(job.type).toBe(AiJobType.QUESTION_GENERATION);
    expect(job.provider).toBe(AiProvider.OPENAI);
    expect(job.model).toBe('gpt-4o');
    expect(job.promptVersion).toBe('v1.0');
    expect(job.relatedEntityId).toBe(sampleParams.relatedEntityId);
    expect(job.relatedEntityType).toBe(AiEntityType.CURRICULUM_NODE);
    expect(job.orgId).toBe(sampleParams.orgId);
    expect(job.requestedBy).toBe(sampleParams.requestedBy);

    const events = job.pullDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(AIJobCreatedEvent);
    const payload = events[0].payload as AIJobCreatedEvent.Payload;
    expect(payload.jobId).toBe(job.id.unpack());
    expect(payload.type).toBe(AiJobType.QUESTION_GENERATION);
  });

  it('should transition to PROCESSING via markProcessing()', () => {
    const job = AiJob.create(sampleParams);
    job.markProcessing();

    expect(job.status).toBe(AiJobStatus.PROCESSING);
    expect(job.isProcessing()).toBe(true);
  });

  it('should complete job and emit AIJobCompletedEvent', () => {
    const job = AiJob.create(sampleParams);
    job.markProcessing();

    const output = { questions: [{ stem: 'What is 2+2?' }] };
    job.complete(output, 250);

    expect(job.status).toBe(AiJobStatus.COMPLETED);
    expect(job.isCompleted()).toBe(true);
    expect(job.isTerminal()).toBe(true);
    expect(job.outputPayload).toEqual(output);
    expect(job.tokensUsed).toBe(250);
    expect(job.completedAt).toBeInstanceOf(Date);

    const events = job.pullDomainEvents();
    const completedEvent = events.find((e) => e instanceof AIJobCompletedEvent);
    expect(completedEvent).toBeDefined();
    const payload = completedEvent!.payload as AIJobCompletedEvent.Payload;
    expect(payload.output).toEqual(output);
    expect(payload.tokensUsed).toBe(250);
  });

  it('should fail job and emit AIJobFailedEvent', () => {
    const job = AiJob.create(sampleParams);
    job.markProcessing();

    job.fail('Rate limit exceeded');

    expect(job.status).toBe(AiJobStatus.FAILED);
    expect(job.isFailed()).toBe(true);
    expect(job.isTerminal()).toBe(true);
    expect(job.errorMessage).toBe('Rate limit exceeded');
    expect(job.completedAt).toBeInstanceOf(Date);

    const events = job.pullDomainEvents();
    const failedEvent = events.find((e) => e instanceof AIJobFailedEvent);
    expect(failedEvent).toBeDefined();
    const payload = failedEvent!.payload as AIJobFailedEvent.Payload;
    expect(payload.errorMessage).toBe('Rate limit exceeded');
  });

  it('should cancel job successfully', () => {
    const job = AiJob.create(sampleParams);
    job.cancel();

    expect(job.status).toBe(AiJobStatus.CANCELLED);
    expect(job.isTerminal()).toBe(true);
  });

  it('should throw InvalidAiJobStateError when modifying a terminal job', () => {
    const job = AiJob.create(sampleParams);
    job.cancel();

    expect(() => job.markProcessing()).toThrow(InvalidAiJobStateError);
    expect(() => job.complete({ questions: [] })).toThrow(InvalidAiJobStateError);
    expect(() => job.fail('error')).toThrow(InvalidAiJobStateError);
    expect(() => job.cancel()).toThrow(InvalidAiJobStateError);
  });
});
