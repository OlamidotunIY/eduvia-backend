import { BaseDomainEvent } from "../../../shared/domain/domain-event";

class AccountSuspendedEvent extends BaseDomainEvent<number, AccountSuspendedEvent.Payload> {
    constructor(
        aggregateId: number,
        payload: AccountSuspendedEvent.Payload,
        correlationId: string
    ){
        super({
            aggregateId,
            eventName: AccountSuspendedEvent.name,
            payload,
            correlationId
        })
    }
}

namespace AccountSuspendedEvent {
    export class Payload{
        constructor(
            public readonly authAccountId: number,
            public readonly userId:number
        ){}
    }
}
export { AccountSuspendedEvent }