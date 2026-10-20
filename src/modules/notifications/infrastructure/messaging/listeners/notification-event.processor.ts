import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import {
  NotificationType,
  NotificationChannel,
  IDeviceTokenRepository,
  IPushNotificationPort,
  IEmailNotificationPort,
} from '../../../domain';
import { CreateNotificationCommand } from '../../../application/commands';

@Processor('notification-events')
@Injectable()
export class NotificationEventProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationEventProcessor.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly deviceTokenRepository: IDeviceTokenRepository,
    @Optional()
    @Inject(IPushNotificationPort)
    private readonly pushNotificationPort?: IPushNotificationPort,
    @Optional()
    @Inject(IEmailNotificationPort)
    private readonly emailNotificationPort?: IEmailNotificationPort,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    const { name, data } = job;
    const payload = data?.payload || {};

    this.logger.log(`Processing notification domain event: ${name}`);

    let recipientId: string | null = null;
    let type: NotificationType | null = null;
    let title = '';
    let body = '';
    let channel: NotificationChannel = NotificationChannel.in_app;
    const notificationData: Record<string, any> = { ...payload };

    switch (name) {
      case 'LessonReportSubmittedEvent':
        recipientId = payload.studentId;
        type = NotificationType.report_submitted;
        title = 'Lesson Report Available';
        body = 'A new lesson report has been submitted and is ready for review.';
        channel = NotificationChannel.all;
        break;

      case 'ReportAiDraftReadyEvent':
        recipientId = payload.teacherId;
        type = NotificationType.report_ai_draft_ready;
        title = 'AI Report Draft Ready';
        body = 'The AI generated lesson summary is ready for your review and approval.';
        channel = NotificationChannel.in_app;
        break;

      case 'LessonScheduledEvent':
        recipientId = payload.studentId;
        type = NotificationType.lesson_scheduled;
        title = 'Lesson Scheduled';
        body = 'A new lesson has been scheduled on your calendar.';
        channel = NotificationChannel.push;
        break;

      case 'LessonCancelledEvent':
        recipientId = payload.studentId;
        type = NotificationType.lesson_cancelled;
        title = 'Lesson Cancelled';
        body = 'A scheduled lesson has been cancelled.';
        channel = NotificationChannel.all;
        break;

      case 'TeacherApplicationReceivedEvent':
        recipientId = payload.orgAdminId || payload.orgId;
        type = NotificationType.teacher_application_received;
        title = 'New Teacher Application';
        body = 'A new teacher application has been submitted to your organization.';
        channel = NotificationChannel.in_app;
        break;

      case 'TeacherApplicationApprovedEvent':
        recipientId = payload.teacherId;
        type = NotificationType.teacher_application_result;
        title = 'Application Approved';
        body = 'Congratulations! Your application to join the organization has been approved.';
        channel = NotificationChannel.all;
        break;

      case 'TeacherApplicationRejectedEvent':
        recipientId = payload.teacherId;
        type = NotificationType.teacher_application_result;
        title = 'Application Status Update';
        body = 'Your application to join the organization has been reviewed.';
        channel = NotificationChannel.email;
        break;

      case 'SubscriptionPaymentFailedEvent':
        recipientId = payload.userId || payload.parentId;
        type = NotificationType.subscription_payment_failed;
        title = 'Subscription Payment Failed';
        body = 'A payment attempt for your subscription has failed. Please update your payment method.';
        channel = NotificationChannel.all;
        break;

      default:
        this.logger.debug(`Unhandled event '${name}' in NotificationEventProcessor`);
        return;
    }

    if (!recipientId || !type) {
      return;
    }

    // 1. Create persisted Notification in database
    await this.commandBus.execute(
      new CreateNotificationCommand(
        recipientId,
        type,
        title,
        body,
        notificationData,
        channel,
      ),
    );

    // 2. Dispatch Push Notification if recipient has active device tokens
    if (this.pushNotificationPort && (channel === NotificationChannel.push || channel === NotificationChannel.all)) {
      try {
        const tokens = await this.deviceTokenRepository.findActiveByUserId(recipientId);
        if (tokens.length > 0) {
          await this.pushNotificationPort.sendPushNotification(
            tokens.map((t) => t.token),
            { title, body, data: notificationData },
          );
        }
      } catch (err: any) {
        this.logger.warn(`Failed to dispatch FCM push notification: ${err.message}`);
      }
    }
  }
}
