import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { AIJobCreatedEvent } from '../../../domain';
import { GenerateReportSummaryCommand } from '../../../application/commands/generate-report-summary/generate-report-summary.command';
import { GenerateNextLessonSuggestionCommand } from '../../../application/commands/generate-next-lesson-suggestion/generate-next-lesson-suggestion.command';

@Processor('ai-events')
export class AiEventProcessor extends WorkerHost {
  private readonly logger = new Logger(AiEventProcessor.name);

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    this.logger.log(`Received event in ai-events: ${job.name}`);

    if (job.name === AIJobCreatedEvent.name) {
      const payload = job.data.payload as AIJobCreatedEvent.Payload;
      this.logger.log(
        `AI Job created: ${payload.jobId} (type: ${payload.type}, entity: ${payload.relatedEntityId})`,
      );
      return;
    }

    if (job.name === 'LessonCompletedEvent') {
      const payload = job.data.payload;
      if (!payload?.lessonId || !payload?.orgId) {
        this.logger.warn(
          'LessonCompletedEvent missing required lessonId or orgId; skipping report summary.',
        );
        return;
      }

      this.logger.log(
        `Triggering AI report summary for completed lesson: ${payload.lessonId}`,
      );

      try {
        await this.commandBus.execute(
          new GenerateReportSummaryCommand({
            lessonId: payload.lessonId,
            lesson: {
              scheduledAt: payload.scheduledAt ?? new Date(),
              durationMins: payload.durationMins ?? 60,
              subject: payload.subject ?? 'General',
              curriculumNodes: payload.curriculumNodes ?? [],
            },
            boardSections: payload.boardSections ?? [],
            assessmentSummary: payload.assessmentSummary ?? {
              totalMarksAwarded: 0,
              totalMaxMarks: 0,
              scorePercent: 0,
              questions: [],
            },
            studentName: payload.studentName ?? 'Student',
            teacherName: payload.teacherName ?? 'Teacher',
            previousReportSummary: payload.previousReportSummary,
            orgId: payload.orgId,
            correlationId: job.data.correlationId,
          }),
        );
      } catch (err: any) {
        this.logger.error(
          `Failed to generate AI report summary for lesson ${payload.lessonId}: ${err.message}`,
          err.stack,
        );
      }
      return;
    }

    if (job.name === 'MasteryUpdatedEvent') {
      const payload = job.data.payload;
      if (!payload?.studentId || !payload?.orgId) {
        this.logger.warn(
          'MasteryUpdatedEvent missing required studentId or orgId; skipping next lesson suggestion.',
        );
        return;
      }

      this.logger.log(
        `Triggering AI next-lesson suggestion for student: ${payload.studentId}`,
      );

      try {
        await this.commandBus.execute(
          new GenerateNextLessonSuggestionCommand({
            student: {
              id: payload.studentId,
              name: payload.studentName ?? 'Student',
              gradeLevel: payload.gradeLevel,
              countryCode: payload.countryCode,
            },
            curriculum: {
              name: payload.curriculumName ?? 'Standard Curriculum',
              shortCode: payload.curriculumCode,
            },
            subject: payload.subject ?? 'General',
            masteryGraph: payload.masteryGraph ?? [],
            recentLessons: payload.recentLessons ?? [],
            orgId: payload.orgId,
            correlationId: job.data.correlationId,
          }),
        );
      } catch (err: any) {
        this.logger.error(
          `Failed to generate next-lesson suggestion for student ${payload.studentId}: ${err.message}`,
          err.stack,
        );
      }
      return;
    }
  }
}
