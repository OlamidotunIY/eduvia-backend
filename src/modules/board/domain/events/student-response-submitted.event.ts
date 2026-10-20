import { BaseDomainEvent } from '@modules/shared';

class StudentResponseSubmittedEvent extends BaseDomainEvent<StudentResponseSubmittedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: StudentResponseSubmittedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: StudentResponseSubmittedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace StudentResponseSubmittedEvent {
  export class Payload {
    constructor(
      public readonly boardId: string,
      public readonly boardQuestionId: string,
      public readonly responseId: string,
      public readonly studentId: string,
      public readonly responseType: string,
    ) {}
  }
}

export { StudentResponseSubmittedEvent };
