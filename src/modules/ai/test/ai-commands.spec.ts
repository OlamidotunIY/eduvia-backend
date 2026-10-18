import { GenerateQuestionsHandler } from '../application/commands/generate-questions/generate-questions.handler';
import { GenerateQuestionsCommand } from '../application/commands/generate-questions/generate-questions.command';
import { GenerateNextLessonSuggestionHandler } from '../application/commands/generate-next-lesson-suggestion/generate-next-lesson-suggestion.handler';
import { GenerateNextLessonSuggestionCommand } from '../application/commands/generate-next-lesson-suggestion/generate-next-lesson-suggestion.command';
import { GenerateReportSummaryHandler } from '../application/commands/generate-report-summary/generate-report-summary.handler';
import { GenerateReportSummaryCommand } from '../application/commands/generate-report-summary/generate-report-summary.command';
import { CreatePromptTemplateHandler } from '../application/commands/create-prompt-template/create-prompt-template.handler';
import { CreatePromptTemplateCommand } from '../application/commands/create-prompt-template/create-prompt-template.command';
import { DeprecatePromptTemplateHandler } from '../application/commands/deprecate-prompt-template/deprecate-prompt-template.handler';
import { DeprecatePromptTemplateCommand } from '../application/commands/deprecate-prompt-template/deprecate-prompt-template.command';
import {
  AiJobType,
  AiJobStatus,
  AiProvider,
  ActiveAiJobConflictError,
  AiPromptTemplateInvariantError,
  AiPromptTemplate,
} from '../domain';

describe('AI CQRS Command Handlers', () => {
  let mockJobRepo: any;
  let mockTemplateRepo: any;
  let mockAiProviderFactory: any;
  let mockAiPort: any;

  beforeEach(() => {
    mockJobRepo = {
      findActiveJob: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };

    mockTemplateRepo = {
      findActiveByType: jest.fn().mockResolvedValue(null),
      findByTypeAndVersion: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };

    mockAiPort = {
      generateText: jest.fn().mockResolvedValue({
        text: JSON.stringify({ questions: [{ stem: 'What is 3x3?' }] }),
        tokensUsed: 45,
        model: 'gpt-4o',
        provider: AiProvider.OPENAI,
      }),
    };

    mockAiProviderFactory = {
      getProvider: jest.fn().mockReturnValue(mockAiPort),
    };
  });

  describe('GenerateQuestionsHandler', () => {
    it('should generate questions and complete AIJob', async () => {
      const handler = new GenerateQuestionsHandler(
        mockJobRepo,
        mockTemplateRepo,
        mockAiProviderFactory,
      );

      const command = new GenerateQuestionsCommand({
        curriculumNode: {
          id: '0192a000-0000-7000-a000-000000000001',
          name: 'Multiplication',
          code: 'MATH-MUL-01',
        },
        curriculumProfile: { name: 'UK National Curriculum' },
        subject: 'Mathematics',
        questionType: 'short_answer',
        difficultyLevel: 2,
        count: 1,
        orgId: '0192a000-0000-7000-a000-000000000002',
      });

      const result = await handler.execute(command);

      expect(result.status).toBe(AiJobStatus.COMPLETED);
      expect(result.tokensUsed).toBe(45);
      expect(mockJobRepo.save).toHaveBeenCalledTimes(2); // Initial processing save + final complete save
    });

    it('should throw ActiveAiJobConflictError if active job already exists', async () => {
      mockJobRepo.findActiveJob.mockResolvedValue({ id: 'existing-job' });

      const handler = new GenerateQuestionsHandler(
        mockJobRepo,
        mockTemplateRepo,
        mockAiProviderFactory,
      );

      const command = new GenerateQuestionsCommand({
        curriculumNode: {
          id: '0192a000-0000-7000-a000-000000000001',
          name: 'Multiplication',
          code: 'MATH-MUL-01',
        },
        curriculumProfile: { name: 'UK National Curriculum' },
        subject: 'Mathematics',
        questionType: 'short_answer',
        difficultyLevel: 2,
        count: 1,
        orgId: '0192a000-0000-7000-a000-000000000002',
      });

      await expect(handler.execute(command)).rejects.toThrow(ActiveAiJobConflictError);
    });
  });

  describe('GenerateNextLessonSuggestionHandler', () => {
    it('should generate next lesson suggestion and complete AIJob', async () => {
      mockAiPort.generateText.mockResolvedValue({
        text: JSON.stringify({
          suggestion: {
            curriculumNodeId: 'node-2',
            nodeName: 'Division',
            rationale: 'Natural progression after multiplication.',
          },
        }),
        tokensUsed: 60,
        model: 'gemini-2.0-flash',
        provider: AiProvider.GEMINI,
      });

      const handler = new GenerateNextLessonSuggestionHandler(
        mockJobRepo,
        mockTemplateRepo,
        mockAiProviderFactory,
      );

      const command = new GenerateNextLessonSuggestionCommand({
        student: { id: 'student-1', name: 'Bob' },
        curriculum: { name: 'Standard' },
        subject: 'Mathematics',
        masteryGraph: [
          { nodeName: 'Multiplication', nodeCode: 'MUL', masteryLevel: 0.9 },
        ],
        orgId: 'org-1',
      });

      const result = await handler.execute(command);

      expect(result.status).toBe(AiJobStatus.COMPLETED);
      expect(result.tokensUsed).toBe(60);
      expect(mockJobRepo.save).toHaveBeenCalled();
    });
  });

  describe('GenerateReportSummaryHandler', () => {
    it('should generate report summary and complete AIJob', async () => {
      mockAiPort.generateText.mockResolvedValue({
        text: JSON.stringify({
          summary: 'Student showed great progress today.',
          strengths: ['Attentive'],
          areasForImprovement: ['Speed'],
          nextSteps: 'Practice more',
        }),
        tokensUsed: 80,
        model: 'gpt-4o',
        provider: AiProvider.OPENAI,
      });

      const handler = new GenerateReportSummaryHandler(
        mockJobRepo,
        mockTemplateRepo,
        mockAiProviderFactory,
      );

      const command = new GenerateReportSummaryCommand({
        lessonId: 'lesson-1',
        lesson: {
          scheduledAt: new Date(),
          durationMins: 45,
          subject: 'Math',
          curriculumNodes: ['MATH-1'],
        },
        boardSections: [{ type: 'notes', content: 'Quadratic formulas' }],
        assessmentSummary: {
          totalMarksAwarded: 8,
          totalMaxMarks: 10,
          scorePercent: 80,
          questions: [],
        },
        studentName: 'Charlie',
        teacherName: 'Mr. Smith',
        orgId: 'org-1',
      });

      const result = await handler.execute(command);

      expect(result.status).toBe(AiJobStatus.COMPLETED);
      expect(result.outputPayload?.summary).toBe('Student showed great progress today.');
    });
  });

  describe('CreatePromptTemplateHandler', () => {
    it('should create prompt template and save', async () => {
      const handler = new CreatePromptTemplateHandler(mockTemplateRepo);

      const command = new CreatePromptTemplateCommand({
        name: 'Report Summary v2',
        type: AiJobType.REPORT_SUMMARY,
        version: 'v2.0',
        systemPrompt: 'System prompt v2',
        userPromptTemplate: 'User prompt {{name}}',
      });

      const result = await handler.execute(command);

      expect(result.name).toBe('Report Summary v2');
      expect(result.version).toBe('v2.0');
      expect(mockTemplateRepo.save).toHaveBeenCalled();
    });

    it('should throw AiPromptTemplateInvariantError on duplicate version', async () => {
      mockTemplateRepo.findByTypeAndVersion.mockResolvedValue({ id: 'existing' });

      const handler = new CreatePromptTemplateHandler(mockTemplateRepo);

      const command = new CreatePromptTemplateCommand({
        name: 'Report Summary v2',
        type: AiJobType.REPORT_SUMMARY,
        version: 'v2.0',
        systemPrompt: 'System prompt v2',
        userPromptTemplate: 'User prompt {{name}}',
      });

      await expect(handler.execute(command)).rejects.toThrow(
        AiPromptTemplateInvariantError,
      );
    });
  });

  describe('DeprecatePromptTemplateHandler', () => {
    it('should deprecate template', async () => {
      const existingTemplate = AiPromptTemplate.create({
        name: 'Test',
        type: AiJobType.REPORT_SUMMARY,
        version: 'v1.0',
        systemPrompt: 'sys',
        userPromptTemplate: 'usr',
      });
      mockTemplateRepo.findById.mockResolvedValue(existingTemplate);

      const handler = new DeprecatePromptTemplateHandler(mockTemplateRepo);
      const result = await handler.execute(
        new DeprecatePromptTemplateCommand(existingTemplate.id.unpack()),
      );

      expect(result.isActive).toBe(false);
      expect(result.deprecatedAt).toBeInstanceOf(Date);
      expect(mockTemplateRepo.save).toHaveBeenCalled();
    });
  });
});
