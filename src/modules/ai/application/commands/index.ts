import { GenerateQuestionsHandler } from './generate-questions/generate-questions.handler';
import { GenerateNextLessonSuggestionHandler } from './generate-next-lesson-suggestion/generate-next-lesson-suggestion.handler';
import { GenerateReportSummaryHandler } from './generate-report-summary/generate-report-summary.handler';
import { CreatePromptTemplateHandler } from './create-prompt-template/create-prompt-template.handler';
import { UpdatePromptTemplateHandler } from './update-prompt-template/update-prompt-template.handler';
import { DeprecatePromptTemplateHandler } from './deprecate-prompt-template/deprecate-prompt-template.handler';
import { CancelAiJobHandler } from './cancel-ai-job/cancel-ai-job.handler';

export * from './generate-questions/generate-questions.command';
export * from './generate-questions/generate-questions.handler';
export * from './generate-next-lesson-suggestion/generate-next-lesson-suggestion.command';
export * from './generate-next-lesson-suggestion/generate-next-lesson-suggestion.handler';
export * from './generate-report-summary/generate-report-summary.command';
export * from './generate-report-summary/generate-report-summary.handler';
export * from './create-prompt-template/create-prompt-template.command';
export * from './create-prompt-template/create-prompt-template.handler';
export * from './update-prompt-template/update-prompt-template.command';
export * from './update-prompt-template/update-prompt-template.handler';
export * from './deprecate-prompt-template/deprecate-prompt-template.command';
export * from './deprecate-prompt-template/deprecate-prompt-template.handler';
export * from './cancel-ai-job/cancel-ai-job.command';
export * from './cancel-ai-job/cancel-ai-job.handler';

export const COMMAND_HANDLERS = [
  GenerateQuestionsHandler,
  GenerateNextLessonSuggestionHandler,
  GenerateReportSummaryHandler,
  CreatePromptTemplateHandler,
  UpdatePromptTemplateHandler,
  DeprecatePromptTemplateHandler,
  CancelAiJobHandler,
];
