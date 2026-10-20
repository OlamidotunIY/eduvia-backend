import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import {
  PlatformAnnouncementId,
  AnnouncementStatus,
} from '../value-objects';
import {
  AnnouncementCreatedEvent,
  AnnouncementPublishedEvent,
  AnnouncementArchivedEvent,
} from '../events';
import { AnnouncementAlreadyPublishedError } from '../errors';

export interface PlatformAnnouncementProps {
  id: PlatformAnnouncementId;
  title: string;
  body: string;
  targetRoles: string[];
  status: AnnouncementStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  archivedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PlatformAnnouncement extends AggregateRoot<PlatformAnnouncementId> {
  private _title: string;
  private _body: string;
  private _targetRoles: string[];
  private _status: AnnouncementStatus;
  private _scheduledAt: Date | null;
  private _publishedAt: Date | null;
  private _archivedAt: Date | null;
  private _createdBy: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: PlatformAnnouncementProps) {
    super(props.id);
    this._title = props.title;
    this._body = props.body;
    this._targetRoles = [...props.targetRoles];
    this._status = props.status;
    this._scheduledAt = props.scheduledAt ? new Date(props.scheduledAt) : null;
    this._publishedAt = props.publishedAt ? new Date(props.publishedAt) : null;
    this._archivedAt = props.archivedAt ? new Date(props.archivedAt) : null;
    this._createdBy = props.createdBy;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(props: {
    id?: PlatformAnnouncementId;
    title: string;
    body: string;
    targetRoles?: string[];
    scheduledAt?: Date | null;
    createdBy: string;
    correlationId?: string;
  }): PlatformAnnouncement {
    if (!props.title || props.title.trim().length === 0) {
      throw new BusinessRuleViolationError('Announcement title cannot be empty.');
    }
    if (!props.body || props.body.trim().length === 0) {
      throw new BusinessRuleViolationError('Announcement body cannot be empty.');
    }
    if (!props.createdBy) {
      throw new BusinessRuleViolationError('Creator user ID is required for announcement.');
    }

    const id = props.id ?? PlatformAnnouncementId.create();
    const now = new Date();
    const status = props.scheduledAt ? AnnouncementStatus.scheduled : AnnouncementStatus.draft;

    const announcement = new PlatformAnnouncement({
      id,
      title: props.title.trim(),
      body: props.body.trim(),
      targetRoles: props.targetRoles ? [...props.targetRoles] : [],
      status,
      scheduledAt: props.scheduledAt ?? null,
      publishedAt: null,
      archivedAt: null,
      createdBy: props.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    announcement.addDomainEvent(
      new AnnouncementCreatedEvent(
        id.value,
        new AnnouncementCreatedEvent.Payload(id.value, announcement.title, props.createdBy),
        props.correlationId ?? id.value,
      ),
    );

    return announcement;
  }

  public static reconstitute(props: PlatformAnnouncementProps): PlatformAnnouncement {
    return new PlatformAnnouncement(props);
  }

  public get title(): string {
    return this._title;
  }

  public get body(): string {
    return this._body;
  }

  public get targetRoles(): string[] {
    return [...this._targetRoles];
  }

  public get status(): AnnouncementStatus {
    return this._status;
  }

  public get scheduledAt(): Date | null {
    return this._scheduledAt ? new Date(this._scheduledAt) : null;
  }

  public get publishedAt(): Date | null {
    return this._publishedAt ? new Date(this._publishedAt) : null;
  }

  public get archivedAt(): Date | null {
    return this._archivedAt ? new Date(this._archivedAt) : null;
  }

  public get createdBy(): string {
    return this._createdBy;
  }

  public get createdAt(): Date {
    return new Date(this._createdAt);
  }

  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  public publish(correlationId?: string): void {
    if (this._status === AnnouncementStatus.published) {
      throw new AnnouncementAlreadyPublishedError(this.id.value);
    }
    const publishedAt = new Date();
    this._status = AnnouncementStatus.published;
    this._publishedAt = publishedAt;
    this._touch();

    this.addDomainEvent(
      new AnnouncementPublishedEvent(
        this.id.value,
        new AnnouncementPublishedEvent.Payload(
          this.id.value,
          this._title,
          this._body,
          this._targetRoles,
          publishedAt,
        ),
        correlationId ?? this.id.value,
      ),
    );
  }

  public schedule(at: Date): void {
    if (this._status === AnnouncementStatus.published) {
      throw new AnnouncementAlreadyPublishedError(this.id.value);
    }
    if (at <= new Date()) {
      throw new BusinessRuleViolationError('Scheduled time must be in the future.');
    }
    this._status = AnnouncementStatus.scheduled;
    this._scheduledAt = new Date(at);
    this._touch();
  }

  public archive(correlationId?: string): void {
    if (this._status === AnnouncementStatus.archived) {
      return;
    }
    const archivedAt = new Date();
    this._status = AnnouncementStatus.archived;
    this._archivedAt = archivedAt;
    this._touch();

    this.addDomainEvent(
      new AnnouncementArchivedEvent(
        this.id.value,
        new AnnouncementArchivedEvent.Payload(this.id.value, archivedAt),
        correlationId ?? this.id.value,
      ),
    );
  }

  public updateContent(title: string, body: string, targetRoles?: string[]): void {
    if (this._status === AnnouncementStatus.published) {
      throw new AnnouncementAlreadyPublishedError(this.id.value);
    }
    if (this._status === AnnouncementStatus.archived) {
      throw new BusinessRuleViolationError('Cannot edit an archived announcement.');
    }
    if (!title || title.trim().length === 0) {
      throw new BusinessRuleViolationError('Announcement title cannot be empty.');
    }
    if (!body || body.trim().length === 0) {
      throw new BusinessRuleViolationError('Announcement body cannot be empty.');
    }

    this._title = title.trim();
    this._body = body.trim();
    if (targetRoles) {
      this._targetRoles = [...targetRoles];
    }
    this._touch();
  }

  private _touch(): void {
    this._updatedAt = new Date();
  }
}
