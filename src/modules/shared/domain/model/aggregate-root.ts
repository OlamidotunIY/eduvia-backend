import { DomainEvent } from '../events';
import { BaseEntityId } from '../value-object/base-entity-id.vo';

abstract class AggregateRoot<TId extends BaseEntityId> {
    readonly id: TId;
    private _domainEvents: DomainEvent[] = [];

    protected constructor(id: TId) {
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

    public getId(): string {
        return this.id.value;
    }
}

export { AggregateRoot };
