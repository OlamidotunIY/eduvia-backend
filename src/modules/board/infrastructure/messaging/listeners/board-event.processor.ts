import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Optional } from '@nestjs/common';
import { CreateBoardCommand } from '../../../application/commands';
import { BoardDocumentService } from '../../sharedb';
import { BoardGateway } from '@modules/websocket';

@Processor('classroom-events')
export class BoardEventProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly boardDocumentService: BoardDocumentService,
    @Optional() private readonly boardGateway?: BoardGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === 'LessonCreatedEvent') {
      const payload = job.data.payload;
      const board = await this.commandBus.execute(
        new CreateBoardCommand({
          lessonId: payload.lessonId,
          orgId: payload.orgId,
          correlationId: job.data.correlationId,
        }),
      );

      if (board?.id) {
        await this.boardDocumentService.createBoardDocument(board.id, {
          id: board.id,
          lessonId: payload.lessonId,
          orgId: payload.orgId,
          mode: 'teach',
          isLocked: false,
          sections: [],
          attachedQuestions: [],
          version: 0,
        });
      }
      return;
    }

    if (job.name === 'BoardModeChangedEvent') {
      const payload = job.data.payload;
      await this.boardDocumentService.switchMode(payload.boardId, payload.mode);
      this.boardGateway?.broadcastModeChange(payload.boardId, payload.mode);
      return;
    }

    if (job.name === 'BoardLockedEvent') {
      const payload = job.data.payload;
      await this.boardDocumentService.setLocked(payload.boardId, true);
      this.boardGateway?.broadcastLockChange(payload.boardId, true);
      return;
    }

    if (job.name === 'BoardUnlockedEvent') {
      const payload = job.data.payload;
      await this.boardDocumentService.setLocked(payload.boardId, false);
      this.boardGateway?.broadcastLockChange(payload.boardId, false);
      return;
    }

    if (job.name === 'BoardSectionAddedEvent') {
      const payload = job.data.payload;
      this.boardGateway?.broadcastSectionAdded(payload.boardId, payload.section);
      return;
    }

    if (job.name === 'BoardSectionUpdatedEvent') {
      const payload = job.data.payload;
      this.boardGateway?.broadcastSectionUpdated(payload.boardId, payload.section);
      return;
    }

    if (job.name === 'BoardSectionRemovedEvent') {
      const payload = job.data.payload;
      this.boardGateway?.broadcastSectionRemoved(payload.boardId, payload.sectionId);
      return;
    }
  }
}
