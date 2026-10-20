import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import {
  IVideoProviderPort,
  MeetingCreateParams,
  MeetingCreateResult,
} from '../../domain/ports/video-provider.port';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

@Injectable()
export class GoogleMeetAdapter implements IVideoProviderPort {
  readonly provider = 'google_meet' as const;
  private readonly logger = new Logger(GoogleMeetAdapter.name);

  private cachedAccessToken: string | null = null;
  private tokenExpiresAt = 0;

  private getServiceAccountKey(): ServiceAccountKey | null {
    try {
      if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        return JSON.parse(
          process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
        ) as ServiceAccountKey;
      }
      if (
        process.env.GOOGLE_SERVICE_ACCOUNT_PATH &&
        fs.existsSync(process.env.GOOGLE_SERVICE_ACCOUNT_PATH)
      ) {
        const content = fs.readFileSync(
          process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
          'utf-8',
        );
        return JSON.parse(content) as ServiceAccountKey;
      }
    } catch (err) {
      this.logger.error(
        `Failed to parse Google Service Account credentials: ${(err as Error).message}`,
      );
    }
    return null;
  }

  private isConfigured(): boolean {
    const key = this.getServiceAccountKey();
    return Boolean(key?.client_email && key?.private_key);
  }

  private async getAccessToken(key: ServiceAccountKey): Promise<string> {
    if (this.cachedAccessToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedAccessToken;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      exp: nowSeconds + 3600,
      iat: nowSeconds,
    };

    const encodeBase64Url = (obj: object) =>
      Buffer.from(JSON.stringify(obj))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    const unsignedToken = `${encodeBase64Url(header)}.${encodeBase64Url(claim)}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedToken);
    const signature = signer
      .sign(key.private_key, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = `${unsignedToken}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google OAuth2 token request failed: ${errText}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.cachedAccessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return this.cachedAccessToken;
  }

  async createMeeting(
    params: MeetingCreateParams,
  ): Promise<MeetingCreateResult> {
    const key = this.getServiceAccountKey();

    if (!key || !key.client_email || !key.private_key) {
      this.logger.warn(
        `Google Service Account credentials not configured. Generating fallback mock Meet link for lesson ${params.lessonId}`,
      );
      const cleanId = params.lessonId.replace(/-/g, '').toLowerCase();
      const codePart1 = cleanId.slice(0, 3) || 'edu';
      const codePart2 = cleanId.slice(3, 7) || 'meet';
      const codePart3 = cleanId.slice(7, 10) || 'live';
      const mockMeetingId = `${codePart1}-${codePart2}-${codePart3}`;
      return {
        meetLink: `https://meet.google.com/${mockMeetingId}`,
        meetingId: mockMeetingId,
        provider: this.provider,
      };
    }

    const accessToken = await this.getAccessToken(key);
    const endTime = new Date(
      params.scheduledAt.getTime() + params.durationMins * 60 * 1000,
    );

    const event = {
      summary: params.topic,
      description: `Eduvia lesson — Org: ${params.orgId} | Lesson: ${params.lessonId}`,
      start: { dateTime: params.scheduledAt.toISOString(), timeZone: 'UTC' },
      end: { dateTime: endTime.toISOString(), timeZone: 'UTC' },
      conferenceData: {
        createRequest: {
          requestId: params.lessonId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      this.logger.error(`Google Calendar event creation failed: ${errorText}`);
      throw new Error(`Failed to create Google Meet event: ${errorText}`);
    }

    const data = (await res.json()) as {
      id: string;
      conferenceData?: {
        entryPoints?: Array<{ entryPointType: string; uri: string }>;
      };
    };

    const meetLink = data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video',
    )?.uri;

    if (!meetLink) {
      throw new Error(
        'Google Meet link was not returned in calendar event response',
      );
    }

    this.logger.log(
      `Google Meet created: ${meetLink} for lesson ${params.lessonId}`,
    );

    return {
      meetLink,
      meetingId: data.id,
      provider: this.provider,
    };
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    const key = this.getServiceAccountKey();
    if (!key || !key.client_email || !key.private_key) {
      this.logger.warn(
        `Google Service Account credentials not configured. Skipping remote deletion for mock meeting ${meetingId}`,
      );
      return;
    }

    try {
      const accessToken = await this.getAccessToken(key);
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${meetingId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok && res.status !== 404) {
        const errText = await res.text();
        this.logger.warn(
          `Failed to delete Google Meet event ${meetingId}: ${errText}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to delete Google Meet event ${meetingId}: ${(error as Error).message}`,
      );
    }
  }
}
