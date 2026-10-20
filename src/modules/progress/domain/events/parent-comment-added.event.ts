import { BaseDomainEvent } from '@modules/shared/domain';
import { CommentAuthorRole } from '../value-objects';

class ParentCommentAddedEvent extends BaseDomainEvent<ParentCommentAddedEvent.Payload> {
  constructor(
    aggregateId: string,
    payload: ParentCommentAddedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: ParentCommentAddedEvent.name,
      payload,
      correlationId,
    });
  }
}

namespace ParentCommentAddedEvent {
  export class Payload {
    constructor(
      public readonly reportId: string,
      public readonly commentId: string,
      public readonly authorId: string,
      public readonly authorRole: CommentAuthorRole,
      public readonly orgId: string,
    ) {}
  }
}

export { ParentCommentAddedEvent };
