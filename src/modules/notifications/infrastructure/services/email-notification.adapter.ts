import { Injectable, Logger } from '@nestjs/common';
import { IEmailNotificationPort, SendEmailParams } from '../../domain';

@Injectable()
export class EmailNotificationAdapter implements IEmailNotificationPort {
  private readonly logger = new Logger(EmailNotificationAdapter.name);

  async sendEmail(params: SendEmailParams): Promise<void> {
    const apiKey = process.env['RESEND_API_KEY'];
    const from = process.env['RESEND_FROM_EMAIL'];
    if (!apiKey || !from) {
      throw new Error(
        'RESEND_API_KEY and RESEND_FROM_EMAIL are required for transactional email delivery',
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: this.renderTemplate(params),
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      this.logger.error(
        `Transactional email provider rejected '${params.template}' for '${params.to}': ${response.status}`,
      );
      throw new Error(`Resend email delivery failed: ${details}`);
    }
  }

  private renderTemplate(params: SendEmailParams): string {
    const code = typeof params.context['code'] === 'string'
      ? params.context['code']
      : null;
    if (code) {
      return `<p>${params.template === 'password-reset' ? 'Use this code to reset your password' : 'Use this code to verify your email address'}:</p><p style="font-size: 28px; font-weight: 700; letter-spacing: 0.2em;">${code}</p><p>This code expires in ${params.context['expiresInMinutes'] ?? 10} minutes.</p>`;
    }
    const body = typeof params.context['body'] === 'string'
      ? params.context['body']
      : params.subject;
    return `<h1>${params.subject}</h1><p>${body}</p>`;
  }
}
