import { DomainEvent } from "./domain-event";

abstract class AggregateRoot< T extends number> {
    readonly id: T;
    private _domainEvents: DomainEvent[] =[];

    protected constructor(id: T) {
        this.id = id;
    }

    protected addDomainEvent(event: DomainEvent): void {
        this._domainEvents.push(event);
    }

    public pullDomainEvents(): DomainEvent[] {
        const events = this._domainEvents;
        this._domainEvents = [];
        return events;
    }

    public abstract getId(): T;
}

export { AggregateRoot }