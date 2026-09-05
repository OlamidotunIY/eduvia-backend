import { BaseDomainEvent } from "../../../shared/domain/domain-event";

class AuthSessionCreatedEvent extends BaseDomainEvent<number, AuthSessionCreatedEvent.Payload>{
    constructor(
        aggregateId: number,
        payload: AuthSessionCreatedEvent.Payload,
        correlationId: string
    ){
        super({
            aggregateId,
            eventName: AuthSessionCreatedEvent.name,
            payload,
            correlationId
        })
    }
}

namespace AuthSessionCreatedEvent {
    export class Payload{
        constructor(
          public readonly authAccountId: number,
          public readonly userId:number  
        ){}
    }
}

export { AuthSessionCreatedEvent }