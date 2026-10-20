import { GetQuestionByIdHandler } from './get-question-by-id/get-question-by-id.handler';
import { SearchQuestionsHandler } from './search-questions/search-questions.handler';
import { GetAssessmentByIdHandler } from './get-assessment-by-id/get-assessment-by-id.handler';
import { ListAssessmentsHandler } from './list-assessments/list-assessments.handler';
import { GetStudentMasteryHandler } from './get-student-mastery/get-student-mastery.handler';

export * from './get-question-by-id/get-question-by-id.query';
export * from './get-question-by-id/get-question-by-id.dto';
export * from './get-question-by-id/get-question-by-id.handler';

export * from './search-questions/search-questions.query';
export * from './search-questions/search-questions.dto';
export * from './search-questions/search-questions.handler';

export * from './get-assessment-by-id/get-assessment-by-id.query';
export * from './get-assessment-by-id/get-assessment-by-id.dto';
export * from './get-assessment-by-id/get-assessment-by-id.handler';

export * from './list-assessments/list-assessments.query';
export * from './list-assessments/list-assessments.dto';
export * from './list-assessments/list-assessments.handler';

export * from './get-student-mastery/get-student-mastery.query';
export * from './get-student-mastery/get-student-mastery.dto';
export * from './get-student-mastery/get-student-mastery.handler';

export const QUERY_HANDLERS = [
  GetQuestionByIdHandler,
  SearchQuestionsHandler,
  GetAssessmentByIdHandler,
  ListAssessmentsHandler,
  GetStudentMasteryHandler,
];
