import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { IOrganizationQueryPort, IUserQueryPort, RedisService } from '@modules/shared';
import { NotificationsGateway } from '@modules/websocket';
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
    @Optional()
    private readonly notificationsGateway?: NotificationsGateway,
    private readonly redis?: RedisService,
    private readonly organizationQueryPort?: IOrganizationQueryPort,
    private readonly userQueryPort?: IUserQueryPort,
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

    if (name === 'NotificationCreatedEvent') {
      this.notificationsGateway?.sendToUser(payload.recipientId, {
        id: payload.notificationId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        channel: payload.channel,
        data: payload.data,
      });
      return;
    }

    if (name === 'AuthVerificationCreatedEvent') {
      await this.deliverVerificationEmail(payload);
      return;
    }

    if (name === 'TeacherApplicationReceivedEvent') {
      const recipientIds = await this.organizationQueryPort?.getActiveAdminUserIds(
        payload.orgId,
      ) ?? [];
      await Promise.all(
        recipientIds.map((recipientId) => this.dispatchNotification({
          recipientId,
          type: NotificationType.teacher_application_received,
          title: 'New teacher application',
          body: 'A teacher has applied to join your organization.',
          data: notificationData,
          channel: NotificationChannel.in_app,
        })),
      );
      return;
    }

    if (name === 'TeacherApplicationOutcomeNotificationRequestedEvent') {
      const approved = payload.outcome === 'approved';
      await this.dispatchNotification({
        recipientId: payload.applicantUserId,
        type: NotificationType.teacher_application_result,
        title: approved ? 'Teacher application approved' : 'Teacher application update',
        body: approved
          ? 'Your application was approved. Your organization access is being prepared.'
          : 'Your application was not approved.',
        data: notificationData,
        channel: NotificationChannel.all,
      });
      return;
    }

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

    await this.dispatchNotification({
      recipientId,
      type,
      title,
      body,
      data: notificationData,
      channel,
    });
  }

  private async dispatchNotification(input: {
    recipientId: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, any>;
    channel: NotificationChannel;
  }): Promise<void> {
    await this.commandBus.execute(
      new CreateNotificationCommand(
        input.recipientId,
        input.type,
        input.title,
        input.body,
        input.data,
        input.channel,
      ),
    );

    if (this.pushNotificationPort && (input.channel === NotificationChannel.push || input.channel === NotificationChannel.all)) {
      try {
        const tokens = await this.deviceTokenRepository.findActiveByUserId(input.recipientId);
        if (tokens.length > 0) {
          await this.pushNotificationPort.sendPushNotification(
            tokens.map((token) => token.token),
            { title: input.title, body: input.body, data: input.data },
          );
        }
      } catch (error: any) {
        this.logger.warn(`Failed to dispatch FCM push notification: ${error.message}`);
      }
    }

    if (this.emailNotificationPort && (input.channel === NotificationChannel.email || input.channel === NotificationChannel.all)) {
      const user = await this.userQueryPort?.getUserById(input.recipientId);
      if (user) {
        await this.emailNotificationPort.sendEmail({
          to: user.email,
          subject: input.title,
          template: input.type,
          context: { ...input.data, title: input.title, body: input.body },
        });
      }
    }
  }

  private async deliverVerificationEmail(payload: {
    identifier?: string;
    verificationType?: string;
    rawValueRedisKey?: string;
  }): Promise<void> {
    if (!payload.identifier || !payload.rawValueRedisKey) {
      this.logger.warn('Verification event is missing its email delivery details');
      return;
    }

    const code = await this.redis?.getClient().get(payload.rawValueRedisKey);
    if (!code) {
      this.logger.warn('Verification OTP is unavailable or expired before delivery');
      return;
    }
    if (!this.emailNotificationPort) {
      throw new Error('Email notification delivery is not configured');
    }

    const verificationType = payload.verificationType ?? 'email_verification';
    const subject = verificationType === 'password_reset'
      ? 'Reset your Eduvia password'
      : 'Verify your Eduvia email address';
    const template = verificationType === 'password_reset'
      ? 'password-reset'
      : 'email-verification';

    await this.emailNotificationPort.sendEmail({
      to: payload.identifier,
      subject,
      template,
      context: { code, expiresInMinutes: 10 },
    });
  }
}
