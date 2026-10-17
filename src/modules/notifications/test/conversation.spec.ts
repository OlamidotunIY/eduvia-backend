import {
  Conversation,
  ConversationType,
  ConversationStatus,
  MessageStatus,
  ConversationCreatedEvent,
  MessageSentEvent,
  ConversationClosedEvent,
  ConversationReopenedEvent,
  ConversationClosedError,
  UnauthorizedConversationParticipantError,
  InvalidConversationParticipantsError,
} from '../domain';

describe('Conversation Aggregate Root', () => {
  const orgId = '018f9210-9c24-7123-8345-abcdef123457';
  const studentId = '018f9210-9c24-7123-8345-abcdef123458';
  const teacherId = '018f9210-9c24-7123-8345-abcdef123459';
  const parentId = '018f9210-9c24-7123-8345-abcdef123460';
  const adminId = '018f9210-9c24-7123-8345-abcdef123461';

  it('should successfully create a student_teacher conversation and emit ConversationCreatedEvent', () => {
    const conversation = Conversation.create({
      orgId,
      type: ConversationType.student_teacher,
      participants: [studentId, teacherId],
      studentId,
      subject: 'Question on Algebra',
    });

    expect(conversation).toBeDefined();
    expect(conversation.type).toBe(ConversationType.student_teacher);
    expect(conversation.status).toBe(ConversationStatus.active);
    expect(conversation.participants).toEqual([studentId, teacherId]);
    expect(conversation.studentId).toBe(studentId);
    expect(conversation.subject).toBe('Question on Algebra');

    const events = conversation.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ConversationCreatedEvent);
  });

  it('should throw error when participants count is not exactly 2 or missing studentId', () => {
    expect(() =>
      Conversation.create({
        orgId,
        type: ConversationType.student_teacher,
        participants: [studentId],
        studentId,
      }),
    ).toThrow(InvalidConversationParticipantsError);

    expect(() =>
      Conversation.create({
        orgId,
        type: ConversationType.student_teacher,
        participants: [studentId, teacherId],
        studentId: null,
      }),
    ).toThrow(InvalidConversationParticipantsError);
  });

  it('should throw error when parent_admin conversation is missing parentId', () => {
    expect(() =>
      Conversation.create({
        orgId,
        type: ConversationType.parent_admin,
        participants: [parentId, adminId],
        parentId: null,
      }),
    ).toThrow(InvalidConversationParticipantsError);
  });

  it('should post message from participant, update lastMessageAt, and emit MessageSentEvent', () => {
    const conversation = Conversation.create({
      orgId,
      type: ConversationType.student_teacher,
      participants: [studentId, teacherId],
      studentId,
    });
    conversation.pullDomainEvents();

    const message = conversation.postMessage(
      studentId,
      'Could you explain question #3?',
      'https://cdn.eduvia.com/attachment.png',
    );

    expect(message).toBeDefined();
    expect(message.content).toBe('Could you explain question #3?');
    expect(message.attachmentUrl).toBe('https://cdn.eduvia.com/attachment.png');
    expect(message.status).toBe(MessageStatus.sent);
    expect(conversation.messages).toHaveLength(1);
    expect(conversation.lastMessageAt).toBeInstanceOf(Date);

    const events = conversation.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(MessageSentEvent);
  });

  it('should reject message posting from a non-participant', () => {
    const conversation = Conversation.create({
      orgId,
      type: ConversationType.student_teacher,
      participants: [studentId, teacherId],
      studentId,
    });

    expect(() =>
      conversation.postMessage('unrelated-user-id', 'Hello there!'),
    ).toThrow(UnauthorizedConversationParticipantError);
  });

  it('should allow closing conversation and reject posting messages while closed', () => {
    const conversation = Conversation.create({
      orgId,
      type: ConversationType.parent_admin,
      participants: [parentId, adminId],
      parentId,
    });
    conversation.pullDomainEvents();

    conversation.close(adminId);
    expect(conversation.status).toBe(ConversationStatus.closed);

    const events = conversation.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ConversationClosedEvent);

    expect(() =>
      conversation.postMessage(parentId, 'Still want to ask something!'),
    ).toThrow(ConversationClosedError);
  });

  it('should allow reopening closed conversation and emit ConversationReopenedEvent', () => {
    const conversation = Conversation.create({
      orgId,
      type: ConversationType.parent_admin,
      participants: [parentId, adminId],
      parentId,
    });
    conversation.close(adminId);
    conversation.pullDomainEvents();

    conversation.reopen(adminId);
    expect(conversation.status).toBe(ConversationStatus.active);

    const events = conversation.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ConversationReopenedEvent);
  });
});
