# Setup Guide — Video Integration (Zoom + Google Meet Link Generation)

> Eduvia does NOT own the video layer. We generate meeting links for Zoom or Google Meet and deliver them to participants when a lesson goes LIVE. The teacher and student use their own Zoom/Meet client.

---

## Architecture Decision

Eduvia delegates video entirely to Zoom or Google Meet. The platform:
1. Generates a unique meeting link when a lesson transitions to `LIVE`
2. Delivers the link to teacher and all enrolled students via WebSocket (`lesson:meet_link_ready`) AND push notification
3. The meeting link is stored on the `Lesson` record for late-joiners

**Why not own the video?** Building compliant, low-latency video at scale is a separate product. Zoom and Meet already handle recording consent, bandwidth adaptation, and mobile clients. Eduvia's value is in the learning workflow around the video — not the video itself.

---

## 1. Port Interface (Video Provider Abstraction)

```typescript
// src/modules/classroom/domain/ports/video-provider.port.ts

export interface MeetingCreateParams {
  topic: string;              // e.g. "GCSE Maths — Alice — Week 12"
  scheduledAt: Date;          // when the meeting is scheduled
  durationMins: number;
  hostEmail: string;          // teacher's email
  orgId: string;
  lessonId: string;
}

export interface MeetingCreateResult {
  meetLink: string;           // the join URL for participants
  hostLink?: string;          // special host URL (Zoom only)
  meetingId?: string;         // provider-specific meeting ID
  provider: 'zoom' | 'google_meet';
}

abstract class IVideoProviderPort {
  abstract createMeeting(params: MeetingCreateParams): Promise<MeetingCreateResult>;
  abstract deleteMeeting(meetingId: string): Promise<void>;
  abstract readonly provider: 'zoom' | 'google_meet';
}

export { IVideoProviderPort };
```

---

## 2. Zoom Adapter

```typescript
// src/modules/classroom/infrastructure/video/zoom.adapter.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IVideoProviderPort, MeetingCreateParams, MeetingCreateResult } from '../../domain/ports/video-provider.port';

@Injectable()
export class ZoomAdapter implements IVideoProviderPort, OnModuleInit {
  readonly provider = 'zoom' as const;
  private readonly logger = new Logger(ZoomAdapter.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private readonly baseUrl = 'https://api.zoom.us/v2';
  private readonly clientId = process.env.ZOOM_CLIENT_ID!;
  private readonly clientSecret = process.env.ZOOM_CLIENT_SECRET!;
  private readonly accountId = process.env.ZOOM_ACCOUNT_ID!;  // Server-to-Server OAuth

  async onModuleInit(): Promise<void> {
    await this.refreshToken();
    this.logger.log('Zoom adapter initialized (Server-to-Server OAuth)');
  }

  // Zoom Server-to-Server OAuth (no user login required)
  private async refreshToken(): Promise<void> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: this.accountId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Zoom OAuth failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  }

  private async getToken(): Promise<string> {
    if (!this.accessToken || Date.now() > this.tokenExpiresAt) {
      await this.refreshToken();
    }
    return this.accessToken!;
  }

  async createMeeting(params: MeetingCreateParams): Promise<MeetingCreateResult> {
    const token = await this.getToken();

    const body = {
      topic: params.topic,
      type: 2,                  // Scheduled meeting
      start_time: params.scheduledAt.toISOString(),
      duration: params.durationMins,
      timezone: 'UTC',
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: false,     // disable waiting room — lesson starts immediately
        mute_upon_entry: false,
        auto_recording: 'none',  // no recording — Eduvia does not record video
        join_before_host: false,
        meeting_authentication: false,
        registrants_email_notification: false,
      },
      password: this.generateMeetingPassword(),
      tracking_fields: [
        { field: 'orgId', value: params.orgId },
        { field: 'lessonId', value: params.lessonId },
      ],
    };

    const response = await fetch(`${this.baseUrl}/users/me/meetings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Zoom meeting creation failed: ${error}`);
      throw new Error(`Failed to create Zoom meeting: ${error}`);
    }

    const meeting = await response.json() as {
      id: number;
      join_url: string;
      start_url: string;
      password: string;
    };

    this.logger.log(`Zoom meeting created: ${meeting.id} for lesson ${params.lessonId}`);

    return {
      meetLink: meeting.join_url,
      hostLink: meeting.start_url,
      meetingId: String(meeting.id),
      provider: this.provider,
    };
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    const token = await this.getToken();

    await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  private generateMeetingPassword(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
```

---

## 3. Google Meet Adapter

```typescript
// src/modules/classroom/infrastructure/video/google-meet.adapter.ts
// Uses Google Calendar API to create events with Meet links
// Google Meet links are automatically created when a Google Calendar event is created

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IVideoProviderPort, MeetingCreateParams, MeetingCreateResult } from '../../domain/ports/video-provider.port';
import { google, calendar_v3 } from 'googleapis';

@Injectable()
export class GoogleMeetAdapter implements IVideoProviderPort, OnModuleInit {
  readonly provider = 'google_meet' as const;
  private readonly logger = new Logger(GoogleMeetAdapter.name);
  private calendar: calendar_v3.Calendar;

  async onModuleInit(): Promise<void> {
    // Use a service account with domain-wide delegation
    // This allows creating calendar events on behalf of org teacher Google accounts
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/calendar'],
      // Optional: impersonate a specific Google Workspace user
      // clientOptions: { subject: 'admin@yourdomain.com' },
    });

    this.calendar = google.calendar({ version: 'v3', auth });
    this.logger.log('Google Meet adapter initialized');
  }

  async createMeeting(params: MeetingCreateParams): Promise<MeetingCreateResult> {
    const endTime = new Date(
      params.scheduledAt.getTime() + params.durationMins * 60 * 1000,
    );

    const event: calendar_v3.Schema$Event = {
      summary: params.topic,
      description: `Eduvia lesson — Org: ${params.orgId} | Lesson: ${params.lessonId}`,
      start: { dateTime: params.scheduledAt.toISOString(), timeZone: 'UTC' },
      end: { dateTime: endTime.toISOString(), timeZone: 'UTC' },
      conferenceData: {
        createRequest: {
          requestId: params.lessonId,           // idempotency key
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      // DO NOT set attendees — we don't want Google to send calendar invites
      // Eduvia handles its own notifications
    };

    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'none',    // suppress Google's own emails
      requestBody: event,
    });

    const meetLink = response.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video',
    )?.uri;

    if (!meetLink) {
      throw new Error('Google Meet link not returned in calendar event response');
    }

    this.logger.log(`Google Meet created: ${meetLink} for lesson ${params.lessonId}`);

    return {
      meetLink,
      meetingId: response.data.id ?? undefined,
      provider: this.provider,
    };
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      await this.calendar.events.delete({ calendarId: 'primary', eventId: meetingId });
    } catch (error) {
      this.logger.warn(`Failed to delete Google Meet event ${meetingId}: ${(error as Error).message}`);
    }
  }
}
```

---

## 4. Video Provider Factory

```typescript
// src/modules/classroom/infrastructure/video/video-provider.factory.ts

import { Injectable } from '@nestjs/common';
import { IVideoProviderPort } from '../../domain/ports/video-provider.port';
import { ZoomAdapter } from './zoom.adapter';
import { GoogleMeetAdapter } from './google-meet.adapter';

@Injectable()
export class VideoProviderFactory {
  constructor(
    private readonly zoom: ZoomAdapter,
    private readonly googleMeet: GoogleMeetAdapter,
  ) {}

  get(provider: 'zoom' | 'google_meet'): IVideoProviderPort {
    return provider === 'zoom' ? this.zoom : this.googleMeet;
  }

  getDefault(): IVideoProviderPort {
    const provider = (process.env.VIDEO_DEFAULT_PROVIDER ?? 'zoom') as 'zoom' | 'google_meet';
    return this.get(provider);
  }
}
```

---

## 5. Meet Link Generation in Lesson Start Flow

```typescript
// src/modules/classroom/application/commands/start-lesson/start-lesson.handler.ts

@CommandHandler(StartLessonCommand)
export class StartLessonHandler implements ICommandHandler<StartLessonCommand> {
  constructor(
    private readonly lessonRepository: ILessonRepository,
    private readonly videoFactory: VideoProviderFactory,
    private readonly classroomRepository: IClassroomRepository,
    @InjectQueue('meet-events') private readonly meetQueue: Queue,
  ) {}

  async execute(command: StartLessonCommand): Promise<void> {
    const lesson = await this.lessonRepository.findById(command.payload.lessonId);
    if (!lesson) throw new LessonNotFoundError();

    const classroom = await this.classroomRepository.findById(lesson.classroomId);

    // Transition state immediately — don't wait for meet link
    lesson.start(null, command.payload.correlationId); // meetLink = null initially
    await this.lessonRepository.save(lesson);
    // ↑ LessonStartedEvent written to outbox — immediately broadcasts status change

    // Queue meet link generation (async — happens in background)
    await this.meetQueue.add('GenerateMeetLink', {
      correlationId: command.payload.correlationId,
      payload: {
        lessonId: lesson.getId(),
        orgId: lesson.orgId,
        classroomId: lesson.classroomId,
        teacherEmail: command.payload.teacherEmail,
        topic: `${classroom.name} — Lesson`,
        scheduledAt: lesson.scheduledAt,
        durationMins: lesson.durationMins,
      },
    });
  }
}
```

```typescript
// src/modules/classroom/application/events/meet.worker.ts
// Generates the meet link and broadcasts it

@Processor('meet-events')
export class MeetEventWorker extends WorkerHost {
  private readonly logger = new Logger(MeetEventWorker.name);

  constructor(
    private readonly videoFactory: VideoProviderFactory,
    private readonly lessonRepository: ILessonRepository,
    private readonly lessonGateway: LessonGateway,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== 'GenerateMeetLink') return;

    const { lessonId, orgId, teacherEmail, topic, scheduledAt, durationMins } = job.data.payload;

    const video = this.videoFactory.getDefault();

    const result = await video.createMeeting({
      topic,
      scheduledAt: new Date(scheduledAt),
      durationMins,
      hostEmail: teacherEmail,
      orgId,
      lessonId,
    });

    // Update the lesson record with the meet link
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) return;

    lesson.setMeetLink(result.meetLink, job.data.correlationId);
    await this.lessonRepository.save(lesson);

    // Broadcast meet link to all participants in the lesson room
    this.lessonGateway.broadcastMeetLink(lessonId, result.meetLink);

    this.logger.log(`Meet link delivered for lesson ${lessonId}: ${result.meetLink}`);
  }
}
```

---

## 6. Lesson Cancellation — Delete Meeting

```typescript
// When a lesson is cancelled, clean up the video meeting

// In the cancel lesson command handler, after saving:
// (via LessonCancelledEvent -> meet-events queue)

@Processor('meet-events')
// Additional case in MeetEventWorker:
case 'LessonCancelledEvent': {
  const { meetingId, provider } = job.data.payload;
  if (meetingId && provider) {
    const video = this.videoFactory.get(provider);
    await video.deleteMeeting(meetingId);
  }
  break;
}
```

---

## 7. Environment Variables

```env
# Video provider
VIDEO_DEFAULT_PROVIDER=zoom      # or 'google_meet'

# Zoom — Server-to-Server OAuth
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...
ZOOM_ACCOUNT_ID=...             # Your Zoom account ID (from Zoom marketplace app settings)

# Google Meet (via Google Calendar API)
GOOGLE_SERVICE_ACCOUNT_PATH=/run/secrets/google-service-account.json
# OR inline JSON:
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

---

## 8. Zoom App Setup

1. Go to [marketplace.zoom.us](https://marketplace.zoom.us)
2. Create a **Server-to-Server OAuth** app (not a user-level OAuth app)
3. Add scopes: `meeting:write:meeting`, `meeting:delete:meeting`
4. Note the `Client ID`, `Client Secret`, and `Account ID`
5. No user needs to authorize — the app acts as your Zoom account

## 9. Google Meet Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable **Google Calendar API**
3. Create a **Service Account**
4. Download the JSON key file
5. Share the service account's email with a Google Calendar (or use Google Workspace domain-wide delegation)
6. The service account creates meetings in the calendar it has access to

> **Recommendation:** For MVP, use Zoom (simpler auth, no Google Workspace dependency). Add Google Meet as an alternative in Phase 2.
