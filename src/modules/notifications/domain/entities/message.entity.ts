import { MessageId, MessageStatus } from '../value-objects';
import { BusinessRuleViolationError } from '@modules/shared/domain';

export interface MessageProps {
  id: MessageId;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  status: MessageStatus;
  sentAt: Date;
  deliveredAt: Date | null;
  readAt: Date | null;
}

export class Message {
  private _id: MessageId;
  private _conversationId: string;
  private _senderId: string;
  private _content: string;
  private _attachmentUrl: string | null;
  private _status: MessageStatus;
  private _sentAt: Date;
  private _deliveredAt: Date | null;
  private _readAt: Date | null;

  protected constructor(props: MessageProps) {
    this._id = props.id;
    this._conversationId = props.conversationId;
    this._senderId = props.senderId;
    this._content = props.content;
    this._attachmentUrl = props.attachmentUrl;
    this._status = props.status;
    this._sentAt = new Date(props.sentAt);
    this._deliveredAt = props.deliveredAt ? new Date(props.deliveredAt) : null;
    this._readAt = props.readAt ? new Date(props.readAt) : null;
  }

  public static create(props: {
    id?: MessageId;
    conversationId: string;
    senderId: string;
    content: string;
    attachmentUrl?: string | null;
  }): Message {
    if (!props.content || props.content.trim().length === 0) {
      throw new BusinessRuleViolationError('Message content cannot be empty.');
    }
    const messageId = props.id ?? MessageId.create();
    return new Message({
      id: messageId,
      conversationId: props.conversationId,
      senderId: props.senderId,
      content: props.content.trim(),
      attachmentUrl: props.attachmentUrl ?? null,
      status: MessageStatus.sent,
      sentAt: new Date(),
      deliveredAt: null,
      readAt: null,
    });
  }

  public static reconstitute(props: MessageProps): Message {
    return new Message(props);
  }

  public markDelivered(): void {
    if (!this._deliveredAt) {
      this._deliveredAt = new Date();
      if (this._status === MessageStatus.sent) {
        this._status = MessageStatus.delivered;
      }
    }
  }

  public markRead(): void {
    if (!this._readAt) {
      this._readAt = new Date();
      this._status = MessageStatus.read;
      if (!this._deliveredAt) {
        this._deliveredAt = this._readAt;
      }
    }
  }

  public get id(): MessageId {
    return this._id;
  }

  public get conversationId(): string {
    return this._conversationId;
  }

  public get senderId(): string {
    return this._senderId;
  }

  public get content(): string {
    return this._content;
  }

  public get attachmentUrl(): string | null {
    return this._attachmentUrl;
  }

  public get status(): MessageStatus {
    return this._status;
  }

  public get sentAt(): Date {
    return this._sentAt;
  }

  public get deliveredAt(): Date | null {
    return this._deliveredAt;
  }

  public get readAt(): Date | null {
    return this._readAt;
  }
}
