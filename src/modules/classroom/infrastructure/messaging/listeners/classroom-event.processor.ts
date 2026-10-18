import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Logger, Optional } from '@nestjs/common';
import { ILessonRepository, VideoProvider } from '../../../domain';
import { VideoProviderFactory } from '../../video';
import { LessonGateway } from '@modules/websocket';

@Processor('classroom-events')
export class ClassroomEventProcessor extends WorkerHost {
  private readonly logger = new Logger(ClassroomEventProcessor.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly lessonRepository: ILessonRepository,
    private readonly videoFactory: VideoProviderFactory,
    @Optional() private readonly lessonGateway?: LessonGateway,
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
        this.lessonGateway?.broadcastMeetLink(lesson.getId(), payload.meetLink);
      }
      return;
    }

    if (job.name === 'LessonStartedEvent') {
      const payload = job.data.payload;
      const lesson = await this.lessonRepository.findById(payload.lessonId);
      if (!lesson) return;

      let meetLink = lesson.meetLink;
      if (!meetLink) {
        const video = this.videoFactory.getDefault();
        const meeting = await video.createMeeting({
          topic: `Classroom Lesson — ${lesson.getId()}`,
          scheduledAt: lesson.scheduledAt,
          durationMins: lesson.durationMins,
          hostEmail: 'teacher@eduvia.internal',
          orgId: lesson.orgId,
          lessonId: lesson.getId(),
        });

        const providerEnum =
          meeting.provider === 'zoom'
            ? VideoProvider.ZOOM
            : VideoProvider.GOOGLE_MEET;

        lesson.attachMeeting(
          meeting.meetingId ?? meeting.meetLink,
          providerEnum,
          meeting.meetLink,
        );
        await this.lessonRepository.save(lesson);
        meetLink = meeting.meetLink;
      }

      if (meetLink) {
        this.lessonGateway?.broadcastMeetLink(lesson.getId(), meetLink);
      }
      this.lessonGateway?.broadcastStatusChange(lesson.getId(), 'LIVE');
      return;
    }

    if (job.name === 'LessonCancelledEvent') {
      const payload = job.data.payload;
      const lesson = await this.lessonRepository.findById(payload.lessonId);
      if (lesson?.meetingId && lesson.videoProvider) {
        try {
          const provider =
            lesson.videoProvider === VideoProvider.ZOOM
              ? 'zoom'
              : 'google_meet';
          const video = this.videoFactory.get(provider);
          await video.deleteMeeting(lesson.meetingId);
        } catch (error) {
          this.logger.warn(
            `Failed to clean up meeting for cancelled lesson ${payload.lessonId}: ${(error as Error).message}`,
          );
        }
      }

      if (lesson) {
        this.lessonGateway?.broadcastStatusChange(lesson.getId(), 'CANCELLED');
      }
      return;
    }
  }
}
