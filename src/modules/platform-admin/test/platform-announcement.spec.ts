import {
  PlatformAnnouncement,
  PlatformAnnouncementId,
  AnnouncementStatus,
  AnnouncementCreatedEvent,
  AnnouncementPublishedEvent,
  AnnouncementArchivedEvent,
  AnnouncementAlreadyPublishedError,
} from '../domain';

describe('PlatformAnnouncement AggregateRoot', () => {
  it('should create an announcement in draft status and emit AnnouncementCreatedEvent', () => {
    const announcement = PlatformAnnouncement.create({
      title: 'Platform Maintenance',
      body: 'Scheduled downtime tonight at 2 AM UTC.',
      targetRoles: ['teacher', 'org_admin'],
      createdBy: 'admin-user-123',
    });

    expect(announcement.id).toBeInstanceOf(PlatformAnnouncementId);
    expect(announcement.title).toBe('Platform Maintenance');
    expect(announcement.body).toBe('Scheduled downtime tonight at 2 AM UTC.');
    expect(announcement.targetRoles).toEqual(['teacher', 'org_admin']);
    expect(announcement.status).toBe(AnnouncementStatus.draft);
    expect(announcement.createdBy).toBe('admin-user-123');
    expect(announcement.publishedAt).toBeNull();
    expect(announcement.archivedAt).toBeNull();

    const events = announcement.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(AnnouncementCreatedEvent);
    expect(events[0].eventName).toBe('AnnouncementCreatedEvent');
  });

  it('should publish a draft announcement and emit AnnouncementPublishedEvent', () => {
    const announcement = PlatformAnnouncement.create({
      title: 'New Feature Release',
      body: 'AI Grading is now available!',
      createdBy: 'admin-user-123',
    });
    announcement.pullDomainEvents();

    announcement.publish();

    expect(announcement.status).toBe(AnnouncementStatus.published);
    expect(announcement.publishedAt).toBeInstanceOf(Date);

    const events = announcement.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(AnnouncementPublishedEvent);
    expect(events[0].eventName).toBe('AnnouncementPublishedEvent');
  });

  it('should throw AnnouncementAlreadyPublishedError when publishing an already published announcement', () => {
    const announcement = PlatformAnnouncement.create({
      title: 'Notice',
      body: 'Important notice',
      createdBy: 'admin-user-123',
    });
    announcement.publish();

    expect(() => announcement.publish()).toThrow(AnnouncementAlreadyPublishedError);
  });

  it('should schedule an announcement for future publication', () => {
    const announcement = PlatformAnnouncement.create({
      title: 'Upcoming Webinar',
      body: 'Join our teacher webinar tomorrow.',
      createdBy: 'admin-user-123',
    });

    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    announcement.schedule(futureDate);

    expect(announcement.status).toBe(AnnouncementStatus.scheduled);
    expect(announcement.scheduledAt).toEqual(futureDate);
  });

  it('should archive an announcement and emit AnnouncementArchivedEvent', () => {
    const announcement = PlatformAnnouncement.create({
      title: 'Old Notice',
      body: 'Archive this message',
      createdBy: 'admin-user-123',
    });
    announcement.publish();
    announcement.pullDomainEvents();

    announcement.archive();

    expect(announcement.status).toBe(AnnouncementStatus.archived);
    expect(announcement.archivedAt).toBeInstanceOf(Date);

    const events = announcement.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(AnnouncementArchivedEvent);
  });

  it('should reconstitute an existing announcement correctly', () => {
    const id = PlatformAnnouncementId.create();
    const now = new Date();
    const announcement = PlatformAnnouncement.reconstitute({
      id,
      title: 'Reconstituted',
      body: 'Restored from DB',
      targetRoles: ['student'],
      status: AnnouncementStatus.published,
      scheduledAt: null,
      publishedAt: now,
      archivedAt: null,
      createdBy: 'admin-1',
      createdAt: now,
      updatedAt: now,
    });

    expect(announcement.id.equals(id)).toBe(true);
    expect(announcement.title).toBe('Reconstituted');
    expect(announcement.status).toBe(AnnouncementStatus.published);
    expect(announcement.pullDomainEvents()).toHaveLength(0);
  });
});
