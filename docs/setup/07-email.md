# Setup Guide — Email (Transactional Email via Resend)

> Full setup for transactional email using Resend with React Email templates, abstracted behind a port so the provider is swappable.

---

## Architecture Decision

Eduvia uses **Resend** as the primary transactional email provider. Resend:
- Has a clean Node.js SDK with TypeScript support
- Supports **React Email** for template composition
- Is significantly more developer-friendly than SendGrid
- Has built-in email previews during development

**All email sending is async** — handled inside the `notification-events` BullMQ worker. No API handler ever sends email synchronously.

---

## 1. Install Dependencies

```bash
pnpm add resend react-email @react-email/components react react-dom
pnpm add -D @types/react @types/react-dom
```

---

## 2. Email Port Interface

```typescript
// src/modules/notifications/domain/ports/email.port.ts

export interface EmailPayload {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, unknown>;
  from?: string;  // defaults to EDUVIA_FROM_EMAIL env var
  replyTo?: string;
}

abstract class IEmailPort {
  abstract send(payload: EmailPayload): Promise<void>;
}

export { IEmailPort };
```

---

## 3. Resend Adapter

```typescript
// src/modules/notifications/infrastructure/email/resend.adapter.ts

import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { IEmailPort, EmailPayload } from '../../domain/ports/email.port';
import { renderEmailTemplate } from './templates/renderer';

@Injectable()
export class ResendAdapter implements IEmailPort {
  private readonly logger = new Logger(ResendAdapter.name);
  private readonly client: Resend;
  private readonly fromEmail: string;

  constructor() {
    this.client = new Resend(process.env.RESEND_API_KEY!);
    this.fromEmail = process.env.EDUVIA_FROM_EMAIL ?? 'noreply@eduvia.com';
  }

  async send(payload: EmailPayload): Promise<void> {
    const html = await renderEmailTemplate(payload.template, payload.data);

    const { error } = await this.client.emails.send({
      from: payload.from ?? `Eduvia <${this.fromEmail}>`,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html,
      replyTo: payload.replyTo,
    });

    if (error) {
      this.logger.error(`Failed to send email via Resend: ${error.message}`, { template: payload.template });
      throw new Error(`Email send failed: ${error.message}`);
    }

    this.logger.debug(`Email sent: ${payload.template} -> ${payload.to}`);
  }
}
```

---

## 4. Email Templates (React Email)

```tsx
// src/modules/notifications/infrastructure/email/templates/renderer.ts

import { render } from '@react-email/components';
import { createElement } from 'react';

// Template registry
import { LessonScheduledEmail } from './lesson-scheduled';
import { LessonCancelledEmail } from './lesson-cancelled';
import { EmailVerificationEmail } from './email-verification';
import { LessonReportReadyEmail } from './lesson-report-ready';
import { TeacherApplicationResultEmail } from './teacher-application-result';
import { OrgInvitationEmail } from './org-invitation';
import { PaymentFailedEmail } from './payment-failed';
import { NewMessageEmail } from './new-message';
import { LessonReminderEmail } from './lesson-reminder';

const templateMap: Record<string, React.ComponentType<Record<string, unknown>>> = {
  lesson_scheduled: LessonScheduledEmail as React.ComponentType<Record<string, unknown>>,
  lesson_cancelled: LessonCancelledEmail as React.ComponentType<Record<string, unknown>>,
  account_verification: EmailVerificationEmail as React.ComponentType<Record<string, unknown>>,
  report_submitted: LessonReportReadyEmail as React.ComponentType<Record<string, unknown>>,
  teacher_application_result: TeacherApplicationResultEmail as React.ComponentType<Record<string, unknown>>,
  org_invitation: OrgInvitationEmail as React.ComponentType<Record<string, unknown>>,
  subscription_payment_failed: PaymentFailedEmail as React.ComponentType<Record<string, unknown>>,
  new_message: NewMessageEmail as React.ComponentType<Record<string, unknown>>,
  lesson_reminder_24h: LessonReminderEmail as React.ComponentType<Record<string, unknown>>,
};

export async function renderEmailTemplate(
  template: string,
  data: Record<string, unknown>,
): Promise<string> {
  const Component = templateMap[template];
  if (!Component) throw new Error(`Unknown email template: ${template}`);

  const element = createElement(Component, data);
  return render(element);
}
```

```tsx
// src/modules/notifications/infrastructure/email/templates/lesson-report-ready.tsx
// Example React Email template

import {
  Html, Head, Body, Container, Section, Text, Button, Hr,
  Heading, Preview, Tailwind,
} from '@react-email/components';

interface LessonReportReadyEmailProps {
  parentName: string;
  studentName: string;
  subject: string;
  lessonDate: string;
  teacherName: string;
  reportUrl: string;
  orgName: string;
}

export function LessonReportReadyEmail({
  parentName,
  studentName,
  subject,
  lessonDate,
  teacherName,
  reportUrl,
  orgName,
}: LessonReportReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{studentName}'s {subject} lesson report from {teacherName} is ready</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-[600px]">
            {/* Header */}
            <Section className="bg-indigo-600 rounded-t-lg px-8 py-6 text-center">
              <Heading className="text-white text-2xl font-bold m-0">Eduvia</Heading>
            </Section>

            {/* Body */}
            <Section className="bg-white px-8 py-6 rounded-b-lg shadow-sm">
              <Text className="text-gray-700 text-base">Hi {parentName},</Text>

              <Text className="text-gray-700 text-base">
                {teacherName} has submitted a lesson report for {studentName}'s{' '}
                <strong>{subject}</strong> lesson on <strong>{lessonDate}</strong>.
              </Text>

              <Text className="text-gray-700 text-base">
                View the full report including what was covered, assessment results,
                and next steps:
              </Text>

              <Section className="text-center my-6">
                <Button
                  href={reportUrl}
                  className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg no-underline"
                >
                  View Lesson Report
                </Button>
              </Section>

              <Hr className="border-gray-200 my-4" />

              <Text className="text-gray-500 text-sm">
                This report was submitted by {teacherName} from {orgName}.
                If you have any questions, please message your org administrator through the Eduvia app.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center mt-4">
              <Text className="text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} Eduvia. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
```

```tsx
// src/modules/notifications/infrastructure/email/templates/email-verification.tsx

import {
  Html, Head, Body, Container, Section, Text, Heading, Preview, Tailwind,
} from '@react-email/components';

interface EmailVerificationEmailProps {
  firstName: string;
  otp: string;
  expiresInMinutes: number;
}

export function EmailVerificationEmail({
  firstName,
  otp,
  expiresInMinutes,
}: EmailVerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Eduvia verification code: {otp}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-[600px]">
            <Section className="bg-white px-8 py-8 rounded-lg shadow-sm">
              <Heading className="text-indigo-600 text-2xl font-bold">Eduvia</Heading>
              <Text className="text-gray-700">Hi {firstName},</Text>
              <Text className="text-gray-700">
                Welcome to Eduvia! Use this code to verify your email address:
              </Text>

              {/* OTP Display */}
              <Section className="bg-gray-50 rounded-lg py-6 text-center my-4">
                <Text className="text-4xl font-mono font-bold tracking-[0.5em] text-indigo-700 m-0">
                  {otp}
                </Text>
              </Section>

              <Text className="text-gray-500 text-sm text-center">
                This code expires in {expiresInMinutes} minutes. Do not share it with anyone.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
```

---

## 5. Email Service (Application-Layer Wrapper)

```typescript
// src/modules/notifications/infrastructure/email/email.service.ts
// This is the service used by the NotificationWorker

import { Injectable } from '@nestjs/common';
import { IEmailPort, EmailPayload } from '../../domain/ports/email.port';

const SUBJECT_MAP: Record<string, string> = {
  account_verification:        'Verify your Eduvia email',
  lesson_scheduled:            'Lesson scheduled — action required',
  lesson_cancelled:            'Your lesson has been cancelled',
  lesson_reminder_24h:         'Reminder: Lesson tomorrow',
  report_submitted:            "Lesson report ready",
  teacher_application_result:  'Your Eduvia application update',
  org_invitation:              "You've been invited to join an org on Eduvia",
  subscription_payment_failed: 'Action required: Payment failed',
  new_message:                 'You have a new message on Eduvia',
};

@Injectable()
export class EmailService {
  constructor(private readonly emailPort: IEmailPort) {}

  async send(payload: Omit<EmailPayload, 'subject'> & { subject?: string }): Promise<void> {
    const subject = payload.subject ?? SUBJECT_MAP[payload.template] ?? 'Message from Eduvia';

    await this.emailPort.send({ ...payload, subject });
  }
}
```

---

## 6. Wire in Module

```typescript
// src/modules/notifications/notifications.module.ts

@Module({
  imports: [BullModule.registerQueue({ name: 'notification-events' })],
  providers: [
    // Bind email port
    { provide: IEmailPort, useClass: ResendAdapter },
    EmailService,
    NotificationWorker,
    // ...
  ],
})
export class NotificationsModule {}
```

---

## 7. Local Email Preview (Development)

```bash
# Run the React Email dev server to preview templates
npx email dev --dir src/modules/notifications/infrastructure/email/templates
# Opens at http://localhost:3000 — visual preview of all templates
```

---

## 8. Environment Variables

```env
RESEND_API_KEY=re_...
EDUVIA_FROM_EMAIL=noreply@eduvia.com

# For custom domain (set up in Resend dashboard):
# 1. Add DNS records for your sending domain
# 2. Set EDUVIA_FROM_EMAIL to your verified domain
```

---

## 9. Lesson Reminder Cron (24h before lesson)

```typescript
// src/modules/classroom/infrastructure/cron/lesson-reminder.cron.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ILessonRepository } from '@modules/classroom';

@Injectable()
export class LessonReminderCron {
  private readonly logger = new Logger(LessonReminderCron.name);

  constructor(
    private readonly lessonRepository: ILessonRepository,
    @InjectQueue('notification-events') private readonly notificationQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendLessonReminders(): Promise<void> {
    const upcoming = await this.lessonRepository.findScheduledBetween(
      new Date(Date.now() + 23 * 60 * 60 * 1000),  // 23 hours from now
      new Date(Date.now() + 25 * 60 * 60 * 1000),  // 25 hours from now
    );

    for (const lesson of upcoming) {
      await this.notificationQueue.add('LessonReminderEvent', {
        correlationId: crypto.randomUUID(),
        payload: {
          type: 'lesson_reminder_24h',
          lessonId: lesson.getId(),
          // ... recipient IDs, email, etc.
        },
      });
    }

    this.logger.log(`Queued ${upcoming.length} lesson reminder notifications`);
  }
}
```

> Add `@nestjs/schedule` (`pnpm add @nestjs/schedule`) and import `ScheduleModule.forRoot()` in `AppModule`.
