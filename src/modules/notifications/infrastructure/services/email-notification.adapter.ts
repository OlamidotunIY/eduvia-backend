import { Injectable, Logger } from '@nestjs/common';
import { IEmailNotificationPort, SendEmailParams } from '../../domain';

@Injectable()
export class EmailNotificationAdapter implements IEmailNotificationPort {
  private readonly logger = new Logger(EmailNotificationAdapter.name);

  async sendEmail(params: SendEmailParams): Promise<void> {
    this.logger.log(
      `[EmailService] Sending email template '${params.template}' to '${params.to}' with subject '${params.subject}'`,
    );
    // In production, integration with Resend / SendGrid delivers transactional email.
  }
}
