export enum AiJobType {
  REPORT_SUMMARY = 'report_summary',
  QUESTION_GENERATION = 'question_generation',
  NEXT_LESSON_SUGGESTION = 'next_lesson_suggestion',
}

export enum AiJobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum AiProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
}

export enum AiEntityType {
  LESSON = 'lesson',
  CURRICULUM_NODE = 'curriculum_node',
  STUDENT = 'student',
}
