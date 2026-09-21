type DomainEventPayload = object;

interface DomainEvent<TPayload extends DomainEventPayload = DomainEventPayload>
{
    readonly eventId: string;
    readonly occurredAt: Date;
    readonly aggregateId: string;
    readonly eventName: string;
    readonly correlationId: string;
    readonly payload: TPayload;
}

abstract class BaseDomainEvent<TPayload extends DomainEventPayload>
implements DomainEvent<TPayload> {
    readonly eventId: string;
    readonly occurredAt: Date;
    readonly aggregateId: string;
    readonly eventName: string;
    readonly correlationId: string;
    readonly payload: TPayload;

    protected constructor(params: {
        aggregateId: string;
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
export { BaseDomainEvent };
