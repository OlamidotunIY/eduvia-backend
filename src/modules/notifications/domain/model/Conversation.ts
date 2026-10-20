import { AggregateRoot, BusinessRuleViolationError } from '@modules/shared/domain';
import {
  ConversationId,
  ConversationType,
  ConversationStatus,
} from '../value-objects';
import { Message } from '../entities/message.entity';
import {
  ConversationCreatedEvent,
  MessageSentEvent,
  ConversationClosedEvent,
  ConversationReopenedEvent,
} from '../events';
import {
  ConversationClosedError,
  InvalidConversationParticipantsError,
  UnauthorizedConversationParticipantError,
} from '../errors';

export interface ConversationProps {
  id: ConversationId;
  orgId: string;
  type: ConversationType;
  participants: string[];
  studentId: string | null;
  parentId: string | null;
  subject: string | null;
  status: ConversationStatus;
  lastMessageAt: Date | null;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export class Conversation extends AggregateRoot<ConversationId> {
  private _orgId: string;
  private _type: ConversationType;
  private _participants: string[];
  private _studentId: string | null;
  private _parentId: string | null;
  private _subject: string | null;
  private _status: ConversationStatus;
  private _lastMessageAt: Date | null;
  private _messages: Message[];
  private _createdAt: Date;
  private _updatedAt: Date;

  protected constructor(props: ConversationProps) {
    super(props.id);
    this._orgId = props.orgId;
    this._type = props.type;
    this._participants = [...props.participants];
    this._studentId = props.studentId ?? null;
    this._parentId = props.parentId ?? null;
    this._subject = props.subject ?? null;
    this._status = props.status;
    this._lastMessageAt = props.lastMessageAt ? new Date(props.lastMessageAt) : null;
    this._messages = props.messages ? [...props.messages] : [];
    this._createdAt = new Date(props.createdAt);
    this._updatedAt = new Date(props.updatedAt);
  }

  public static create(
    props: {
      id?: ConversationId;
      orgId: string;
      type: ConversationType;
      participants: string[];
      studentId?: string | null;
      parentId?: string | null;
      subject?: string | null;
    },
    correlationId = 'conversation-starter',
  ): Conversation {
    if (!props.orgId) {
      throw new BusinessRuleViolationError('Organization ID is required to start a conversation.');
    }
    if (!props.participants || props.participants.length !== 2) {
      throw new InvalidConversationParticipantsError(
        'A conversation must have exactly two participants.',
      );
    }

    if (props.type === ConversationType.student_teacher && !props.studentId) {
      throw new InvalidConversationParticipantsError(
        'Student ID must be specified for student_teacher conversations.',
      );
    }

    if (props.type === ConversationType.parent_admin && !props.parentId) {
      throw new InvalidConversationParticipantsError(
        'Parent ID must be specified for parent_admin conversations.',
      );
    }

    const conversationId = props.id ?? ConversationId.create();
    const now = new Date();

    const conversation = new Conversation({
      id: conversationId,
      orgId: props.orgId,
      type: props.type,
      participants: props.participants,
      studentId: props.studentId ?? null,
      parentId: props.parentId ?? null,
      subject: props.subject?.trim() ?? null,
      status: ConversationStatus.active,
      lastMessageAt: null,
      messages: [],
      createdAt: now,
      updatedAt: now,
    });

    conversation.addDomainEvent(
      new ConversationCreatedEvent(
        conversationId.toString(),
        new ConversationCreatedEvent.Payload(
          conversationId.toString(),
          props.orgId,
          props.type,
          props.participants,
          props.studentId ?? null,
          props.parentId ?? null,
          props.subject?.trim() ?? null,
        ),
        correlationId,
      ),
    );

    return conversation;
  }

  public static reconstitute(props: ConversationProps): Conversation {
    return new Conversation(props);
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  public postMessage(
    senderId: string,
    content: string,
    attachmentUrl?: string | null,
    correlationId = 'message-poster',
  ): Message {
    if (this._status === ConversationStatus.closed) {
      throw new ConversationClosedError(this.id.toString());
    }
    if (!this._participants.includes(senderId)) {
      throw new UnauthorizedConversationParticipantError(senderId, this.id.toString());
    }

    const message = Message.create({
      conversationId: this.id.toString(),
      senderId,
      content,
      attachmentUrl,
    });

    this._messages.push(message);
    this._lastMessageAt = new Date();
    this.touch();

    this.addDomainEvent(
      new MessageSentEvent(
        message.id.toString(),
        new MessageSentEvent.Payload(
          message.id.toString(),
          this.id.toString(),
          senderId,
          message.content,
          message.attachmentUrl,
          message.sentAt,
        ),
        correlationId,
      ),
    );

    return message;
  }

  public close(closedBy: string, correlationId = 'admin-action'): void {
    if (this._status === ConversationStatus.closed) return;
    this._status = ConversationStatus.closed;
    this.touch();

    this.addDomainEvent(
      new ConversationClosedEvent(
        this.id.toString(),
        new ConversationClosedEvent.Payload(this.id.toString(), this._orgId, closedBy),
        correlationId,
      ),
    );
  }

  public reopen(reopenedBy: string, correlationId = 'admin-action'): void {
    if (this._status === ConversationStatus.active) return;
    this._status = ConversationStatus.active;
    this.touch();

    this.addDomainEvent(
      new ConversationReopenedEvent(
        this.id.toString(),
        new ConversationReopenedEvent.Payload(this.id.toString(), this._orgId, reopenedBy),
        correlationId,
      ),
    );
  }

  public get orgId(): string {
    return this._orgId;
  }

  public get type(): ConversationType {
    return this._type;
  }

  public get participants(): string[] {
    return [...this._participants];
  }

  public get studentId(): string | null {
    return this._studentId;
  }

  public get parentId(): string | null {
    return this._parentId;
  }

  public get subject(): string | null {
    return this._subject;
  }

  public get status(): ConversationStatus {
    return this._status;
  }

  public get lastMessageAt(): Date | null {
    return this._lastMessageAt;
  }

  public get messages(): Message[] {
    return [...this._messages];
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
