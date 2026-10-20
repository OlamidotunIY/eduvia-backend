import {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationCreatedEvent,
  NotificationDeliveredEvent,
  NotificationReadEvent,
} from '../domain';

describe('Notification Aggregate Root', () => {
  const recipientId = '018f9210-9c24-7123-8345-abcdef123456';

  it('should create a notification with default in_app channel and unread status and emit NotificationCreatedEvent', () => {
    const notification = Notification.create({
      recipientId,
      type: NotificationType.lesson_scheduled,
      title: 'New Lesson Scheduled',
      body: 'Your math lesson is on Monday at 10:00 AM.',
      data: { lessonId: 'lesson-123' },
    });

    expect(notification).toBeDefined();
    expect(notification.recipientId).toBe(recipientId);
    expect(notification.type).toBe(NotificationType.lesson_scheduled);
    expect(notification.channel).toBe(NotificationChannel.in_app);
    expect(notification.status).toBe(NotificationStatus.unread);
    expect(notification.deliveredAt).toBeNull();
    expect(notification.readAt).toBeNull();

    const events = notification.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(NotificationCreatedEvent);
    expect((events[0] as NotificationCreatedEvent).payload.title).toBe('New Lesson Scheduled');
  });

  it('should throw an error if recipientId, title, or body is missing', () => {
    expect(() =>
      Notification.create({
        recipientId: '',
        type: NotificationType.lesson_scheduled,
        title: 'Title',
        body: 'Body',
      }),
    ).toThrow('Recipient ID is required');

    expect(() =>
      Notification.create({
        recipientId,
        type: NotificationType.lesson_scheduled,
        title: '   ',
        body: 'Body',
      }),
    ).toThrow('title cannot be empty');

    expect(() =>
      Notification.create({
        recipientId,
        type: NotificationType.lesson_scheduled,
        title: 'Title',
        body: '',
      }),
    ).toThrow('body cannot be empty');
  });

  it('should mark notification as delivered and emit NotificationDeliveredEvent', () => {
    const notification = Notification.create({
      recipientId,
      type: NotificationType.report_submitted,
      title: 'Report Available',
      body: 'Report has been submitted.',
    });
    notification.pullDomainEvents();

    notification.markDelivered();
    expect(notification.deliveredAt).toBeInstanceOf(Date);

    const events = notification.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(NotificationDeliveredEvent);
  });

  it('should mark notification as read and emit NotificationReadEvent', () => {
    const notification = Notification.create({
      recipientId,
      type: NotificationType.report_submitted,
      title: 'Report Available',
      body: 'Report has been submitted.',
    });
    notification.pullDomainEvents();

    notification.markRead();
    expect(notification.status).toBe(NotificationStatus.read);
    expect(notification.readAt).toBeInstanceOf(Date);

    const events = notification.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(NotificationReadEvent);
  });

  it('should reconstitute from persistence without emitting domain events', () => {
    const now = new Date();
    const notification = Notification.reconstitute({
      id: { toString: () => 'notif-1', unpack: () => 'notif-1' } as any,
      recipientId,
      type: NotificationType.lesson_reminder_24h,
      title: 'Lesson in 24 hours',
      body: 'Don’t forget your lesson tomorrow!',
      data: {},
      channel: NotificationChannel.push,
      status: NotificationStatus.read,
      deliveredAt: now,
      readAt: now,
      createdAt: now,
      updatedAt: now,
    });

    expect(notification.id.toString()).toBe('notif-1');
    expect(notification.status).toBe(NotificationStatus.read);
    expect(notification.pullDomainEvents()).toHaveLength(0);
  });
});
