import { BaseDomainEvent } from "../../../shared/domain/domain-event";

class TokenIssuedEvent extends BaseDomainEvent<number, TokenIssuedEvent.Payload> {
    constructor(
        aggregateId: number,
        payload: TokenIssuedEvent.Payload,
        correlationId: string
    ) {
        super({
            aggregateId,
            eventName: TokenIssuedEvent.name,
            payload,
            correlationId
        });
    }
}

namespace TokenIssuedEvent {
    export class Payload {
        constructor(
            public readonly authAccountId: number,
            public readonly userId: number
        ) {}
    }
}

export { TokenIssuedEvent };