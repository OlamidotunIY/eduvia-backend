type DomainEventPayload = object;

interface DomainEvent<TId extends number = number, TPayload extends DomainEventPayload = DomainEventPayload> 
{
    readonly eventId: string;
    readonly occurredAt: Date;
    readonly aggregateId: TId;
    readonly eventName: string;
    readonly correlationId: string;
    readonly payload: TPayload;
}

abstract class BaseDomainEvent<TId extends number, TPayload extends DomainEventPayload> 
implements DomainEvent<TId, TPayload>{
    readonly eventId: string;
    readonly occurredAt: Date;
    readonly aggregateId: TId;
    readonly eventName: string;
    readonly correlationId: string;
    readonly payload: TPayload;

    protected constructor(params: {
        aggregateId: TId;
        eventName: string;
        payload: TPayload;
        correlationId: string;
    }) {
        this.eventId = crypto.randomUUID();
        this.occurredAt = new Date();
        this.aggregateId = params.aggregateId;
        this.eventName = params.eventName;
        this.correlationId = params.correlationId;
        this.payload = params.payload;
    }
}

export type { DomainEvent, DomainEventPayload };
export { BaseDomainEvent}
