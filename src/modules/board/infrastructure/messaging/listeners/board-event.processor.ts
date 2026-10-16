import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBoardCommand } from '../../../application/commands';

@Processor('classroom-events')
export class BoardEventProcessor extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === 'LessonCreatedEvent') {
      const payload = job.data.payload;
      await this.commandBus.execute(
        new CreateBoardCommand({
          lessonId: payload.lessonId,
          orgId: payload.orgId,
          correlationId: job.data.correlationId,
        }),
      );
    }
  }
}
