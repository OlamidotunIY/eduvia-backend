import { AiProvider } from '../../../domain';

export class GenerateReportSummaryCommand {
  constructor(
    public readonly params: {
      lessonId: string;
      lesson: {
        scheduledAt: Date | string;
        durationMins: number;
        subject: string;
        curriculumNodes: string[];
      };
      boardSections: Array<{ type: string; content: string }>;
      assessmentSummary: {
        totalMarksAwarded: number;
        totalMaxMarks: number;
        scorePercent: number;
        questions: Array<{
          stem: string;
          marksAwarded: number;
          maxMarks: number;
          isCorrect: boolean;
          feedback?: string;
        }>;
      };
      studentName: string;
      teacherName: string;
      previousReportSummary?: string;
      orgId: string;
      requestedBy?: string;
      provider?: AiProvider;
      model?: string;
      correlationId?: string;
    },
  ) {}
}
