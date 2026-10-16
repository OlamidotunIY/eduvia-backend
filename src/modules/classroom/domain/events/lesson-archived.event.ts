import { BaseDomainEvent } from '@modules/shared';

class LessonArchivedEvent extends BaseDomainEvent<LessonArchivedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: LessonArchivedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonArchivedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace LessonArchivedEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly orgId: string,
    ) {}
  }
}

export { LessonArchivedEvent };
