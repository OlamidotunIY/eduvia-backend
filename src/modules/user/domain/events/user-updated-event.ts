import { BaseDomainEvent } from "../../../shared/domain/domain-event";
import { UserType } from "../value-objects/user-type.v0";

class UserUpdatedEvent extends BaseDomainEvent<number, UserUpdatedEvent.Payload> {
    constructor(
        aggregateId: number,
        payload: UserUpdatedEvent.Payload,
        correlationId: string
    ){
        super({
            aggregateId,
            eventName: UserUpdatedEvent.name,
            payload,
            correlationId
        })
    }
}

    namespace UserUpdatedEvent {
        export class Payload{
            constructor(
                public readonly userId: number,
                public readonly userType: UserType,
                public readonly email: string
            ){} 
        }
    }

    export { UserUpdatedEvent }