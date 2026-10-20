import {
  AiPromptTemplate,
  AiJobType,
  AiPromptTemplateInvariantError,
} from '../domain';

describe('AiPromptTemplate Aggregate Root', () => {
  const sampleParams = {
    name: 'lesson_report_summary_v1',
    type: AiJobType.REPORT_SUMMARY,
    version: '1.0.0',
    systemPrompt: 'You are an educational summarizer.',
    userPromptTemplate:
      'Generate report for student {{studentName}} in subject {{subject}}.',
    isActive: true,
  };

  it('should create an active prompt template', () => {
    const template = AiPromptTemplate.create(sampleParams);

    expect(template.name).toBe('lesson_report_summary_v1');
    expect(template.type).toBe(AiJobType.REPORT_SUMMARY);
    expect(template.version).toBe('1.0.0');
    expect(template.systemPrompt).toBe(sampleParams.systemPrompt);
    expect(template.userPromptTemplate).toBe(sampleParams.userPromptTemplate);
    expect(template.isActive).toBe(true);
    expect(template.deprecatedAt).toBeNull();
  });

  it('should render user prompt with provided variables', () => {
    const template = AiPromptTemplate.create(sampleParams);

    const rendered = template.renderUserPrompt({
      studentName: 'Alice',
      subject: 'Physics',
    });

    expect(rendered).toBe('Generate report for student Alice in subject Physics.');
  });

  it('should update prompt template fields', () => {
    const template = AiPromptTemplate.create(sampleParams);

    template.updateTemplate({
      systemPrompt: 'Updated system prompt.',
      userPromptTemplate: 'Updated for {{studentName}}.',
    });

    expect(template.systemPrompt).toBe('Updated system prompt.');
    expect(template.userPromptTemplate).toBe('Updated for {{studentName}}.');
  });

  it('should throw AiPromptTemplateInvariantError when updating with empty string', () => {
    const template = AiPromptTemplate.create(sampleParams);

    expect(() =>
      template.updateTemplate({
        systemPrompt: '   ',
      }),
    ).toThrow(AiPromptTemplateInvariantError);
  });

  it('should deprecate and activate template', () => {
    const template = AiPromptTemplate.create(sampleParams);

    template.deprecate();
    expect(template.isActive).toBe(false);
    expect(template.deprecatedAt).toBeInstanceOf(Date);

    template.activate();
    expect(template.isActive).toBe(true);
    expect(template.deprecatedAt).toBeNull();
  });
});
