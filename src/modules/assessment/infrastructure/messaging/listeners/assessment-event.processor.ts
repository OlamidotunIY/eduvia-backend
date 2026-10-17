import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Optional, Inject } from '@nestjs/common';
import { IBoardQueryPort, SharedBoardQuestionDto } from '@modules/shared';
import { CreateAssessmentCommand } from '../../../application/commands';
import { QuestionType, MarkingStatus } from '../../../domain';

@Processor('classroom-events')
export class AssessmentEventProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    @Optional()
    @Inject(IBoardQueryPort)
    private readonly boardQueryPort?: IBoardQueryPort,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === 'LessonCompletedEvent') {
      const payload = job.data.payload;
      const { lessonId, orgId } = payload;

      if (!this.boardQueryPort) return;

      const board = await this.boardQueryPort.getBoardByLessonId(lessonId);
      if (!board) return;

      const boardQuestions: SharedBoardQuestionDto[] =
        await this.boardQueryPort.getBoardQuestions(board.id);

      // Auto-create assessment for this completed lesson
      const items = boardQuestions.map((bq) => {
        const isMcq = bq.mode === 'mcq';
        return {
          boardQuestionId: bq.id,
          studentResponseId: `auto-resp-${bq.id}`,
          questionType: isMcq ? QuestionType.mcq : QuestionType.short_answer,
          maxMarks: bq.maxMarks,
          autoMarked: isMcq,
          marksAwarded: isMcq ? bq.maxMarks : null,
          status: isMcq ? MarkingStatus.auto_marked : MarkingStatus.pending,
        };
      });

      await this.commandBus.execute(
        new CreateAssessmentCommand({
          orgId,
          lessonId,
          boardId: board.id,
          studentId: payload.studentId ?? 'lesson-participant',
          items,
          correlationId: job.data.correlationId,
        }),
      );
    }
  }
}
