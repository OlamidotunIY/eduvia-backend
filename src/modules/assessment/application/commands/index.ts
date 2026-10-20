import { CreateQuestionHandler } from './create-question/create-question.handler';
import { PublishQuestionHandler } from './publish-question/publish-question.handler';
import { UnpublishQuestionHandler } from './unpublish-question/unpublish-question.handler';
import { UpdateQuestionContentHandler } from './update-question-content/update-question-content.handler';
import { CreateAssessmentHandler } from './create-assessment/create-assessment.handler';
import { ApplyTeacherMarkHandler } from './apply-teacher-mark/apply-teacher-mark.handler';
import { FinalizeAssessmentHandler } from './finalize-assessment/finalize-assessment.handler';
import { ApplyMasteryOverrideHandler } from './apply-mastery-override/apply-mastery-override.handler';

export * from './create-question/create-question.command';
export * from './create-question/create-question.result';
export * from './create-question/create-question.handler';

export * from './publish-question/publish-question.command';
export * from './publish-question/publish-question.result';
export * from './publish-question/publish-question.handler';

export * from './unpublish-question/unpublish-question.command';
export * from './unpublish-question/unpublish-question.result';
export * from './unpublish-question/unpublish-question.handler';

export * from './update-question-content/update-question-content.command';
export * from './update-question-content/update-question-content.result';
export * from './update-question-content/update-question-content.handler';

export * from './create-assessment/create-assessment.command';
export * from './create-assessment/create-assessment.result';
export * from './create-assessment/create-assessment.handler';

export * from './apply-teacher-mark/apply-teacher-mark.command';
export * from './apply-teacher-mark/apply-teacher-mark.result';
export * from './apply-teacher-mark/apply-teacher-mark.handler';

export * from './finalize-assessment/finalize-assessment.command';
export * from './finalize-assessment/finalize-assessment.result';
export * from './finalize-assessment/finalize-assessment.handler';

export * from './apply-mastery-override/apply-mastery-override.command';
export * from './apply-mastery-override/apply-mastery-override.result';
export * from './apply-mastery-override/apply-mastery-override.handler';

export const COMMAND_HANDLERS = [
  CreateQuestionHandler,
  PublishQuestionHandler,
  UnpublishQuestionHandler,
  UpdateQuestionContentHandler,
  CreateAssessmentHandler,
  ApplyTeacherMarkHandler,
  FinalizeAssessmentHandler,
  ApplyMasteryOverrideHandler,
];
