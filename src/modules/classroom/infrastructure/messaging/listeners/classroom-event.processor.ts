import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { ILessonRepository } from '../../../domain';

@Processor('classroom-events')
export class ClassroomEventProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly lessonRepository: ILessonRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === 'LessonReportSubmittedEvent') {
      const payload = job.data.payload;
      const lesson = await this.lessonRepository.findById(payload.lessonId);
      if (lesson) {
        lesson.markReported(job.data.correlationId);
        await this.lessonRepository.save(lesson);
      }
      return;
    }

    if (job.name === 'MeetingCreatedEvent') {
      const payload = job.data.payload;
      const lesson = await this.lessonRepository.findById(payload.lessonId);
      if (lesson) {
        lesson.attachMeeting(
          payload.meetingId,
          payload.videoProvider,
          payload.meetLink,
        );
        await this.lessonRepository.save(lesson);
      }
      return;
    }
  }
}
