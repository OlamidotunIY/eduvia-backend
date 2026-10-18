import { ZoomAdapter } from '../infrastructure/video/zoom.adapter';
import { GoogleMeetAdapter } from '../infrastructure/video/google-meet.adapter';
import { VideoProviderFactory } from '../infrastructure/video/video-provider.factory';
import { ClassroomEventProcessor } from '../infrastructure/messaging/listeners/classroom-event.processor';
import { Lesson } from '../domain/model/Lesson';
import { LessonStatus } from '../domain/value-objects/lesson-status.vo';
import { VideoProvider } from '../domain/value-objects/video-provider.vo';

describe('Video Integration (Phase 2)', () => {
  describe('ZoomAdapter', () => {
    it('generates fallback mock meeting when unconfigured', async () => {
      const adapter = new ZoomAdapter();
      const result = await adapter.createMeeting({
        topic: 'Maths Lesson',
        scheduledAt: new Date(),
        durationMins: 60,
        hostEmail: 'teacher@eduvia.internal',
        orgId: 'org-1',
        lessonId: 'lesson-12345',
      });

      expect(result.provider).toBe('zoom');
      expect(result.meetLink).toContain('https://zoom.us/j/');
      expect(result.meetingId).toBeDefined();
    });

    it('safely deletes meeting without error in fallback mode', async () => {
      const adapter = new ZoomAdapter();
      await expect(adapter.deleteMeeting('zoom-12345')).resolves.toBeUndefined();
    });
  });

  describe('GoogleMeetAdapter', () => {
    it('generates fallback mock meet link when unconfigured', async () => {
      const adapter = new GoogleMeetAdapter();
      const result = await adapter.createMeeting({
        topic: 'Science Lesson',
        scheduledAt: new Date(),
        durationMins: 45,
        hostEmail: 'teacher@eduvia.internal',
        orgId: 'org-1',
        lessonId: 'lesson-67890',
      });

      expect(result.provider).toBe('google_meet');
      expect(result.meetLink).toContain('https://meet.google.com/');
      expect(result.meetingId).toBeDefined();
    });

    it('safely deletes meeting without error in fallback mode', async () => {
      const adapter = new GoogleMeetAdapter();
      await expect(adapter.deleteMeeting('mock-meet-id')).resolves.toBeUndefined();
    });
  });

  describe('VideoProviderFactory', () => {
    it('resolves correct adapter by provider key', () => {
      const zoom = new ZoomAdapter();
      const googleMeet = new GoogleMeetAdapter();
      const factory = new VideoProviderFactory(zoom, googleMeet);

      expect(factory.get('zoom')).toBe(zoom);
      expect(factory.get('google_meet')).toBe(googleMeet);
      expect(factory.getDefault()).toBe(zoom);
    });
  });

  describe('ClassroomEventProcessor with Video', () => {
    it('generates meeting and broadcasts via LessonGateway on LessonStartedEvent', async () => {
      const zoom = new ZoomAdapter();
      const googleMeet = new GoogleMeetAdapter();
      const factory = new VideoProviderFactory(zoom, googleMeet);

      const mockLesson = Lesson.create({
        orgId: 'org-1',
        classroomId: 'room-1',
        teacherId: 'teacher-1',
        scheduledAt: new Date(),
        durationMins: 60,
      });
      mockLesson.schedule();
      mockLesson.start();

      let savedLesson: Lesson | null = null;
      const mockLessonRepo: any = {
        findById: jest.fn().mockResolvedValue(mockLesson),
        save: jest.fn().mockImplementation((l) => {
          savedLesson = l;
          return Promise.resolve();
        }),
      };

      const broadcastMeetLink = jest.fn();
      const broadcastStatusChange = jest.fn();
      const mockGateway: any = {
        broadcastMeetLink,
        broadcastStatusChange,
      };

      const processor = new ClassroomEventProcessor(
        {} as any,
        mockLessonRepo,
        factory,
        mockGateway,
      );

      await processor.process({
        name: 'LessonStartedEvent',
        data: {
          payload: {
            lessonId: mockLesson.getId(),
            orgId: 'org-1',
          },
        },
      } as any);

      expect(savedLesson).not.toBeNull();
      expect(savedLesson!.meetLink).toBeDefined();
      expect(broadcastMeetLink).toHaveBeenCalledWith(
        mockLesson.getId(),
        savedLesson!.meetLink,
      );
      expect(broadcastStatusChange).toHaveBeenCalledWith(
        mockLesson.getId(),
        'LIVE',
      );
    });

    it('deletes meeting and broadcasts cancellation on LessonCancelledEvent', async () => {
      const zoom = new ZoomAdapter();
      const googleMeet = new GoogleMeetAdapter();
      const factory = new VideoProviderFactory(zoom, googleMeet);

      const mockLesson = Lesson.create({
        orgId: 'org-1',
        classroomId: 'room-1',
        teacherId: 'teacher-1',
        scheduledAt: new Date(),
        durationMins: 60,
      });
      mockLesson.attachMeeting('meeting-123', VideoProvider.ZOOM, 'https://zoom.us/j/meeting-123');

      const mockLessonRepo: any = {
        findById: jest.fn().mockResolvedValue(mockLesson),
      };

      const broadcastStatusChange = jest.fn();
      const mockGateway: any = {
        broadcastStatusChange,
      };

      const deleteMeetingSpy = jest.spyOn(zoom, 'deleteMeeting');

      const processor = new ClassroomEventProcessor(
        {} as any,
        mockLessonRepo,
        factory,
        mockGateway,
      );

      await processor.process({
        name: 'LessonCancelledEvent',
        data: {
          payload: {
            lessonId: mockLesson.getId(),
          },
        },
      } as any);

      expect(deleteMeetingSpy).toHaveBeenCalledWith('meeting-123');
      expect(broadcastStatusChange).toHaveBeenCalledWith(
        mockLesson.getId(),
        'CANCELLED',
      );
    });
  });
});
