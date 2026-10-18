import { Injectable, Logger } from '@nestjs/common';
import {
  IVideoProviderPort,
  MeetingCreateParams,
  MeetingCreateResult,
} from '../../domain/ports/video-provider.port';

@Injectable()
export class ZoomAdapter implements IVideoProviderPort {
  readonly provider = 'zoom' as const;
  private readonly logger = new Logger(ZoomAdapter.name);
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  private readonly baseUrl = 'https://api.zoom.us/v2';
  private readonly clientId = process.env.ZOOM_CLIENT_ID;
  private readonly clientSecret = process.env.ZOOM_CLIENT_SECRET;
  private readonly accountId = process.env.ZOOM_ACCOUNT_ID; // Server-to-Server OAuth

  private isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret && this.accountId);
  }

  // Zoom Server-to-Server OAuth (no user login required)
  private async refreshToken(): Promise<void> {
    if (!this.isConfigured()) return;

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: this.accountId!,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zoom OAuth failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  }

  private async getToken(): Promise<string | null> {
    if (!this.isConfigured()) return null;
    if (!this.accessToken || Date.now() > this.tokenExpiresAt) {
      await this.refreshToken();
    }
    return this.accessToken;
  }

  async createMeeting(
    params: MeetingCreateParams,
  ): Promise<MeetingCreateResult> {
    const token = await this.getToken();

    if (!token) {
      this.logger.warn(
        `Zoom credentials not configured. Generating fallback mock meeting for lesson ${params.lessonId}`,
      );
      const mockMeetingId = `zoom-${params.lessonId.replace(/-/g, '').slice(0, 10)}`;
      return {
        meetLink: `https://zoom.us/j/${mockMeetingId}`,
        hostLink: `https://zoom.us/s/${mockMeetingId}`,
        meetingId: mockMeetingId,
        provider: this.provider,
      };
    }

    const body = {
      topic: params.topic,
      type: 2, // Scheduled meeting
      start_time: params.scheduledAt.toISOString(),
      duration: params.durationMins,
      timezone: 'UTC',
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: false, // lesson starts immediately
        mute_upon_entry: false,
        auto_recording: 'none', // no recording — Eduvia does not record video
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

    const meeting = (await response.json()) as {
      id: number;
      join_url: string;
      start_url: string;
      password: string;
    };

    this.logger.log(
      `Zoom meeting created: ${meeting.id} for lesson ${params.lessonId}`,
    );

    return {
      meetLink: meeting.join_url,
      hostLink: meeting.start_url,
      meetingId: String(meeting.id),
      provider: this.provider,
    };
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    const token = await this.getToken();
    if (!token) {
      this.logger.warn(
        `Zoom credentials not configured. Skipping remote deletion for mock meeting ${meetingId}`,
      );
      return;
    }

    const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok && response.status !== 404) {
      const err = await response.text();
      this.logger.warn(`Failed to delete Zoom meeting ${meetingId}: ${err}`);
    }
  }

  private generateMeetingPassword(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
