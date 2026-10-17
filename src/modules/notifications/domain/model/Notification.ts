import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import {
  NotificationId,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from '../value-objects';
import {
  NotificationCreatedEvent,
  NotificationDeliveredEvent,
  NotificationReadEvent,
} from '../events';

export interface NotificationProps {
  id: NotificationId;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  channel: NotificationChannel;
  status: NotificationStatus;
  deliveredAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Notification extends AggregateRoot<NotificationId> {
  private _recipientId: string;
  private _type: NotificationType;
  private _title: string;
  private _body: string;
  private _data: Record<string, any>;
  private _channel: NotificationChannel;
  private _status: NotificationStatus;
  private _deliveredAt: Date | null;
  private _readAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: NotificationProps) {
    super(props.id);
    this._recipientId = props.recipientId;
    this._type = props.type;
    this._title = props.title;
    this._body = props.body;
    this._data = props.data;
    this._channel = props.channel;
    this._status = props.status;
    this._deliveredAt = props.deliveredAt ? new Date(props.deliveredAt) : null;
    this._readAt = props.readAt ? new Date(props.readAt) : null;
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(
    props: {
      id?: NotificationId;
      recipientId: string;
      type: NotificationType;
      title: string;
      body: string;
      data?: Record<string, any>;
      channel?: NotificationChannel;
    },
    correlationId = 'notifications-system',
  ): Notification {
    if (!props.recipientId) {
      throw new BusinessRuleViolationError('Recipient ID is required for a notification.');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new BusinessRuleViolationError('Notification title cannot be empty.');
    }
    if (!props.body || props.body.trim().length === 0) {
      throw new BusinessRuleViolationError('Notification body cannot be empty.');
    }

    const notificationId = props.id ?? NotificationId.create();
    const now = new Date();
    const data = props.data ?? {};
    const channel = props.channel ?? NotificationChannel.in_app;

    const notification = new Notification({
      id: notificationId,
      recipientId: props.recipientId,
      type: props.type,
      title: props.title.trim(),
      body: props.body.trim(),
      data,
      channel,
      status: NotificationStatus.unread,
      deliveredAt: null,
      readAt: null,
      createdAt: now,
      updatedAt: now,
    });

    notification.addDomainEvent(
      new NotificationCreatedEvent(
        notificationId.toString(),
        new NotificationCreatedEvent.Payload(
          notificationId.toString(),
          props.recipientId,
          props.type,
          props.title.trim(),
          props.body.trim(),
          channel,
          data,
        ),
        correlationId,
      ),
    );

    return notification;
  }

  public static reconstitute(props: NotificationProps): Notification {
    return new Notification(props);
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  public markDelivered(correlationId = 'delivery-worker'): void {
    if (this._deliveredAt) return;
    this._deliveredAt = new Date();
    this.touch();

    this.addDomainEvent(
      new NotificationDeliveredEvent(
        this.id.toString(),
        new NotificationDeliveredEvent.Payload(
          this.id.toString(),
          this._recipientId,
          this._deliveredAt,
        ),
        correlationId,
      ),
    );
  }

  public markRead(correlationId = 'user-action'): void {
    if (this._status === NotificationStatus.read) return;
    this._status = NotificationStatus.read;
    this._readAt = new Date();
    this.touch();

    this.addDomainEvent(
      new NotificationReadEvent(
        this.id.toString(),
        new NotificationReadEvent.Payload(
          this.id.toString(),
          this._recipientId,
          this._readAt,
        ),
        correlationId,
      ),
    );
  }

  public get recipientId(): string {
    return this._recipientId;
  }

  public get type(): NotificationType {
    return this._type;
  }

  public get title(): string {
    return this._title;
  }

  public get body(): string {
    return this._body;
  }

  public get data(): Record<string, any> {
    return this._data;
  }

  public get channel(): NotificationChannel {
    return this._channel;
  }

  public get status(): NotificationStatus {
    return this._status;
  }

  public get deliveredAt(): Date | null {
    return this._deliveredAt;
  }

  public get readAt(): Date | null {
    return this._readAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
