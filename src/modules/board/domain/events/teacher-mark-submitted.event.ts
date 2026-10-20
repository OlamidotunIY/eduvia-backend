import { BaseDomainEvent } from '@modules/shared';

class TeacherMarkSubmittedEvent extends BaseDomainEvent<TeacherMarkSubmittedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: TeacherMarkSubmittedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: TeacherMarkSubmittedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace TeacherMarkSubmittedEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly boardQuestionId: string,
      public readonly responseId: string,
      public readonly studentId: string,
      public readonly marksAwarded: number,
      public readonly maxMarks: number,
      public readonly markedBy: string,
    ) {}
  }
}

export { TeacherMarkSubmittedEvent };
