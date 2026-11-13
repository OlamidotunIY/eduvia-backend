import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Optional, Inject } from '@nestjs/common';
import { IBoardQueryPort } from '@modules/shared';
import { CreateAssessmentCommand } from '../../../application/commands';

@Processor('assessment-events')
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

      const responses = await this.boardQueryPort.getStudentResponsesByBoardId(
        board.id,
      );
      const studentIds = Array.from(
        new Set(responses.map((response) => response.studentId)),
      );

      for (const studentId of studentIds) {
        await this.commandBus.execute(
          new CreateAssessmentCommand({
            orgId,
            lessonId,
            boardId: board.id,
            studentId,
            correlationId: job.data.correlationId,
          }),
        );
      }
    }
  }
}
