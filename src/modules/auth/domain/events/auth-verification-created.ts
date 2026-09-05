import { BaseDomainEvent } from "../../../shared/domain/domain-event";

class AuthVerificationCreatedEvent extends BaseDomainEvent<number, AuthVerificationCreatedEvent.Payload> {
    constructor(
        aggregateId: number,
        payload: AuthVerificationCreatedEvent.Payload,
        correlationId: string
    ){
        super({
            aggregateId,
            eventName: AuthVerificationCreatedEvent.name,
            payload,
            correlationId
        })
    }
}

namespace AuthVerificationCreatedEvent {
    export class Payload{
        constructor(
            public readonly authAccountId: number,
            public readonly userId:number
        ){}
    }
}

export { AuthVerificationCreatedEvent }