import { BaseDomainEvent } from "../../../shared/domain/domain-event";
import { UserType } from "../value-objects/user-type.v0";

class UserCreatedEvent extends BaseDomainEvent<number, UserCreatedEvent.Payload> {
    constructor(
        aggregateId: number,
        payload: UserCreatedEvent.Payload,
        correlationId: string
    ){
        super({
            aggregateId,
            eventName: UserCreatedEvent.name,
            payload,
            correlationId
        })
    } 
}  

    namespace UserCreatedEvent {
        export class Payload{
            constructor(
                public readonly userId: number,
                public readonly userType: UserType,
                public readonly email: string
            ){} 
        }
    }

    export { UserCreatedEvent }
