import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Optional, Inject } from '@nestjs/common';
import {
  IAssessmentQueryPort,
  IBoardQueryPort,
  IClassroomQueryPort,
} from '@modules/shared';
import {
  CreateLessonReportCommand,
  AttachAiSummaryCommand,
  UpdateStudentProgressSummaryCommand,
} from '../../../application/commands';
import { ILessonReportRepository, LessonReportId } from '../../../domain';

@Processor('progress-events')
export class ProgressEventProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly reportRepository: ILessonReportRepository,
    @Optional()
    @Inject(IAssessmentQueryPort)
    private readonly assessmentQueryPort?: IAssessmentQueryPort,
    @Optional()
    @Inject(IBoardQueryPort)
    private readonly boardQueryPort?: IBoardQueryPort,
    @Optional()
    @Inject(IClassroomQueryPort)
    private readonly classroomQueryPort?: IClassroomQueryPort,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    const { name, data } = job;
    const payload = data?.payload || {};

    if (name === 'LessonCompletedEvent' || name === 'LessonMarkingEvent') {
      const { lessonId, orgId, classroomId, teacherId, studentId } = payload;
      if (!lessonId || !orgId) return;

      // Query board topics if available
      let topicNodeIds: string[] = [];
      if (this.boardQueryPort) {
        const board = await this.boardQueryPort.getBoardByLessonId(lessonId);
        if (board) {
          // Topics could be fetched from board plan if exposed
        }
      }

      // Query assessment if available
      let totalQuestionsAttempted = 0;
      let totalQuestionsCorrect = 0;
      let totalMarksAwarded: number | null = null;
      let totalMaxMarks = 0;
      let scorePercent: number | null = null;

      if (this.assessmentQueryPort && studentId) {
        const assessment =
          await this.assessmentQueryPort.getAssessmentByLessonAndStudent(
            lessonId,
            studentId,
          );
        if (assessment) {
          totalMaxMarks = assessment.totalMaxMarks;
          totalMarksAwarded = assessment.totalMarksAwarded;
          scorePercent = assessment.scorePercent;
        }
      }

      await this.commandBus.execute(
        new CreateLessonReportCommand({
          lessonId,
          orgId,
          classroomId: classroomId || 'default-classroom',
          teacherId: teacherId || 'default-teacher',
          studentId: studentId || 'default-student',
          topicNodeIds,
          totalQuestionsAttempted,
          totalQuestionsCorrect,
          totalMarksAwarded,
          totalMaxMarks,
          scorePercent,
          correlationId: data.correlationId,
        }),
      );
    } else if (name === 'MasteryUpdatedEvent') {
      const { studentId, orgId, subjectId, masteryLevel } = payload;
      if (!studentId || !orgId) return;

      await this.commandBus.execute(
        new UpdateStudentProgressSummaryCommand({
          studentId,
          orgId,
          subjectId: subjectId || 'general',
          overallMasteryLevel: typeof masteryLevel === 'number' ? masteryLevel : null,
        }),
      );
    } else if (name === 'AIJobCompletedEvent') {
      if (payload.type === 'report_summary' && payload.relatedEntityId) {
        // Find report for lessonId or direct reportId
        let report = await this.reportRepository.findByLessonId(
          payload.relatedEntityId,
        );
        if (!report) {
          report = await this.reportRepository.findById(
            LessonReportId.from(payload.relatedEntityId),
          );
        }

        if (report && payload.output?.summary) {
          await this.commandBus.execute(
            new AttachAiSummaryCommand({
              reportId: report.id.unpack(),
              aiGeneratedSummary: payload.output.summary,
              correlationId: data.correlationId,
            }),
          );
        }
      }
    }
  }
}
