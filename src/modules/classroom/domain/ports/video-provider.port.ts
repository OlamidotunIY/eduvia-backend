export interface MeetingCreateParams {
  topic: string; // e.g. "GCSE Maths — Alice — Week 12"
  scheduledAt: Date; // when the meeting is scheduled
  durationMins: number;
  hostEmail: string; // teacher's email
  orgId: string;
  lessonId: string;
}

export interface MeetingCreateResult {
  meetLink: string; // the join URL for participants
  hostLink?: string; // special host URL (Zoom only)
  meetingId?: string; // provider-specific meeting ID
  provider: 'zoom' | 'google_meet';
}

export abstract class IVideoProviderPort {
  abstract createMeeting(
    params: MeetingCreateParams,
  ): Promise<MeetingCreateResult>;
  abstract deleteMeeting(meetingId: string): Promise<void>;
  abstract readonly provider: 'zoom' | 'google_meet';
}
