# DDD Architecture Reference — Aggregate Root, Entity, Value Object & Cross-Module DI

> This document is the definitive reference for the architectural patterns used in Eduvia. Every module MUST follow these patterns. Do not deviate.

---

## 1. The Building Blocks of the Domain Layer

### 1.1 Value Object

A **Value Object** is immutable, has no identity, and is defined entirely by its attributes. Two value objects with the same attributes are equal. They enforce their own invariants in the constructor/factory.

**Rules:**
- No public setters
- All validation in constructor or `create()` factory
- Must be immutable after construction
- Equality is by value, not by reference
- Should not reach out to external services or throw infrastructure exceptions

```typescript
// src/modules/shared/domain/value-object/base-entity-id.vo.ts
// (already exists — UUIDv7-enforcing base class)

// ✅ Example: A domain-specific typed ID (extends the base)
// src/modules/classroom/domain/value-objects/classroom-id.vo.ts
import { BaseEntityId } from '@modules/shared';

class ClassroomId extends BaseEntityId {
  private constructor(value: string) {
    super(value); // BaseEntityId validates UUIDv7
  }

  static create(): ClassroomId {
    return new ClassroomId(this.nextValue()); // generates UUIDv7
  }

  static from(value: string): ClassroomId {
    return new ClassroomId(value); // re-hydrates from DB
  }
}

export { ClassroomId };
```

```typescript
// ✅ Example: A rich business value object (NOT an ID)
// src/modules/classroom/domain/value-objects/recurrence-pattern.vo.ts

class RecurrencePattern {
  readonly dayOfWeek: number;    // 0 = Sunday, 6 = Saturday
  readonly startTime: string;    // "HH:mm" in local timezone
  readonly timezone: string;     // IANA tz e.g. "Europe/London"
  readonly intervalWeeks: number;
  readonly effectiveFrom: Date;
  readonly effectiveUntil: Date | null;

  private constructor(params: {
    dayOfWeek: number;
    startTime: string;
    timezone: string;
    intervalWeeks: number;
    effectiveFrom: Date;
    effectiveUntil: Date | null;
  }) {
    this.dayOfWeek = params.dayOfWeek;
    this.startTime = params.startTime;
    this.timezone = params.timezone;
    this.intervalWeeks = params.intervalWeeks;
    this.effectiveFrom = params.effectiveFrom;
    this.effectiveUntil = params.effectiveUntil;
  }

  static create(params: {
    dayOfWeek: number;
    startTime: string;
    timezone: string;
    intervalWeeks?: number;
    effectiveFrom: Date;
    effectiveUntil?: Date | null;
  }): RecurrencePattern {
    if (params.dayOfWeek < 0 || params.dayOfWeek > 6) {
      throw new ClassroomInvariantError('dayOfWeek must be 0–6');
    }

    if (!/^\d{2}:\d{2}$/.test(params.startTime)) {
      throw new ClassroomInvariantError('startTime must be in HH:mm format');
    }

    if ((params.intervalWeeks ?? 1) < 1) {
      throw new ClassroomInvariantError('intervalWeeks must be >= 1');
    }

    return new RecurrencePattern({
      dayOfWeek: params.dayOfWeek,
      startTime: params.startTime,
      timezone: params.timezone,
      intervalWeeks: params.intervalWeeks ?? 1,
      effectiveFrom: params.effectiveFrom,
      effectiveUntil: params.effectiveUntil ?? null,
    });
  }

  // Behaviour method: computes the next occurrence after a given date
  nextOccurrenceAfter(after: Date): Date {
    // ... date arithmetic using dayOfWeek, startTime, timezone, intervalWeeks
    // Returns the next DateTime this lesson would occur
  }

  equals(other: RecurrencePattern): boolean {
    return (
      this.dayOfWeek === other.dayOfWeek &&
      this.startTime === other.startTime &&
      this.timezone === other.timezone &&
      this.intervalWeeks === other.intervalWeeks
    );
  }
}

export { RecurrencePattern };
```

---

### 1.2 Entity

An **Entity** has a stable identity (its ID) but is NOT an aggregate root — it does not own a consistency boundary and is not saved/loaded independently. It lives inside an Aggregate Root.

**Rules:**
- Has an ID but is NOT independently persisted (the aggregate root saves it)
- Cannot emit domain events directly
- Behaviour methods enforce local invariants
- Never accessed from outside its aggregate except through the aggregate root's methods

```typescript
// ✅ Example: AvailabilitySlot inside TeacherAvailability aggregate
// src/modules/classroom/domain/entities/availability-slot.entity.ts

import { AvailabilitySlotId } from '../value-objects/availability-slot-id.vo';
import { ClassroomInvariantError } from '../errors';

class AvailabilitySlot {
  readonly id: AvailabilitySlotId;
  private _dayOfWeek: number;
  private _startTime: string;   // "HH:mm"
  private _endTime: string;     // "HH:mm"
  private _timezone: string;

  private constructor(params: {
    id: AvailabilitySlotId;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
  }) {
    this.id = params.id;
    this._dayOfWeek = params.dayOfWeek;
    this._startTime = params.startTime;
    this._endTime = params.endTime;
    this._timezone = params.timezone;
  }

  static create(params: Omit<ConstructorParameters<typeof AvailabilitySlot>[0], never>): AvailabilitySlot {
    if (params.dayOfWeek < 0 || params.dayOfWeek > 6) {
      throw new ClassroomInvariantError('dayOfWeek must be 0–6');
    }
    if (params.startTime >= params.endTime) {
      throw new ClassroomInvariantError('startTime must be before endTime');
    }
    return new AvailabilitySlot(params);
  }

  static reconstitute(params: {
    id: AvailabilitySlotId;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
  }): AvailabilitySlot {
    return new AvailabilitySlot(params);
  }

  overlaps(other: AvailabilitySlot): boolean {
    if (this._dayOfWeek !== other._dayOfWeek) return false;
    return this._startTime < other._endTime && this._endTime > other._startTime;
  }

  get dayOfWeek(): number { return this._dayOfWeek; }
  get startTime(): string { return this._startTime; }
  get endTime(): string { return this._endTime; }
  get timezone(): string { return this._timezone; }
}

export { AvailabilitySlot };
```

---

### 1.3 Aggregate Root

An **Aggregate Root** is the consistency boundary. It:
- Controls all mutations to itself and its child entities
- Is the unit of persistence (saved and loaded as one unit)
- Is the only thing that emits domain events
- Has a typed ID value object
- Exposes `create()` (new instance), `reconstitute()` (re-hydrate from DB), and domain behaviour methods

```typescript
// ✅ Example: TeacherAvailability aggregate root
// src/modules/classroom/domain/model/TeacherAvailability.ts

import { AggregateRoot } from '@modules/shared';
import { TeacherAvailabilityId } from '../value-objects/teacher-availability-id.vo';
import { AvailabilitySlot } from '../entities/availability-slot.entity';
import { AvailabilitySlotId } from '../value-objects/availability-slot-id.vo';
import { AvailabilityException } from '../entities/availability-exception.entity';
import { ClassroomInvariantError, SlotConflictError } from '../errors';
import {
  AvailabilitySlotAddedEvent,
  AvailabilitySlotRemovedEvent,
} from '../events';

class TeacherAvailability extends AggregateRoot<TeacherAvailabilityId> {
  public readonly orgId: string;
  public readonly teacherId: string;
  public readonly createdAt: Date;
  private _slots: AvailabilitySlot[];
  private _exceptions: AvailabilityException[];
  private _updatedAt: Date;

  // ❌ Never expose a public constructor — force use of create() or reconstitute()
  private constructor(params: {
    id: TeacherAvailabilityId;
    orgId: string;
    teacherId: string;
    slots: AvailabilitySlot[];
    exceptions: AvailabilityException[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);
    this.orgId = params.orgId;
    this.teacherId = params.teacherId;
    this._slots = [...params.slots];
    this._exceptions = [...params.exceptions];
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  // ── Factory: new aggregate (first time created) ───────────────────────────
  static create(params: {
    id: TeacherAvailabilityId;
    orgId: string;
    teacherId: string;
    correlationId: string;
  }): TeacherAvailability {
    if (!params.orgId.trim()) throw new ClassroomInvariantError('orgId required');
    if (!params.teacherId.trim()) throw new ClassroomInvariantError('teacherId required');

    const now = new Date();
    const availability = new TeacherAvailability({
      id: params.id,
      orgId: params.orgId,
      teacherId: params.teacherId,
      slots: [],
      exceptions: [],
      createdAt: now,
      updatedAt: now,
    });

    // No event emitted on creation — not yet interesting to external consumers
    return availability;
  }

  // ── Factory: re-hydrate from persistence (mapper calls this) ─────────────
  static reconstitute(params: {
    id: TeacherAvailabilityId;
    orgId: string;
    teacherId: string;
    slots: AvailabilitySlot[];
    exceptions: AvailabilityException[];
    createdAt: Date;
    updatedAt: Date;
  }): TeacherAvailability {
    return new TeacherAvailability(params);
  }

  // ── Domain behaviour ──────────────────────────────────────────────────────

  addSlot(slot: AvailabilitySlot, correlationId: string): void {
    // Enforce invariant: no overlapping slots on the same day
    const hasConflict = this._slots.some(
      (existing) => existing.dayOfWeek === slot.dayOfWeek && existing.overlaps(slot),
    );
    if (hasConflict) throw new SlotConflictError(slot.dayOfWeek, slot.startTime);

    this._slots.push(slot);
    this.touch();

    this.addDomainEvent(
      new AvailabilitySlotAddedEvent(
        this.getId(),
        new AvailabilitySlotAddedEvent.Payload(
          this.getId(),
          this.teacherId,
          this.orgId,
          slot.id.value,
          slot.dayOfWeek,
          slot.startTime,
          slot.endTime,
        ),
        correlationId,
      ),
    );
  }

  removeSlot(slotId: string, correlationId: string): void {
    const index = this._slots.findIndex((s) => s.id.value === slotId);
    if (index === -1) throw new ClassroomInvariantError('Slot not found');

    this._slots.splice(index, 1);
    this.touch();

    this.addDomainEvent(
      new AvailabilitySlotRemovedEvent(
        this.getId(),
        new AvailabilitySlotRemovedEvent.Payload(this.getId(), this.teacherId, slotId),
        correlationId,
      ),
    );
  }

  isAvailableAt(datetime: Date): boolean {
    // Check if a given UTC datetime falls within any slot, accounting for exceptions
    // ... implementation uses timezone-aware comparison
    return true; // simplified
  }

  // ── Getters (read-only views of internal state) ───────────────────────────
  get slots(): ReadonlyArray<AvailabilitySlot> { return this._slots; }
  get exceptions(): ReadonlyArray<AvailabilityException> { return this._exceptions; }
  get updatedAt(): Date { return this._updatedAt; }

  private touch(): void { this._updatedAt = new Date(); }
}

export { TeacherAvailability };
```

---

## 2. Cross-Module Communication — The Professional DDD Pattern

### The Problem

In NestJS, modules naturally want to import each other. For example, `AuthModule` needs to look up a `User` by email when someone logs in. The naive approach (`auth` imports `UserRepository` directly) **violates module boundaries** and creates a tightly-coupled monolith that cannot be extracted into services later.

### The Rule

> **A module's domain layer may NEVER directly import anything from another module's domain or infrastructure layer.**

Cross-module communication uses exactly two patterns, depending on context:

- **Pattern A — Domain Events** for anything that changes state in another module (writes and async side effects)
- **Pattern B — Shared Query Ports** for synchronous cross-module reads

There is no application "facade" layer: modules never expose their command/query buses or application services to each other.

---

### Pattern A — Domain Events (for cross-module writes and async side effects)

Used when one module needs to trigger work in another module AFTER a state change, without waiting for a result. **All cross-module writes go through events** — a module never dispatches a command or calls a port that mutates another module's data.

The producing module emits a domain event → Outbox → BullMQ → the consuming module's processor handles it by dispatching a command **inside its own module**.

**Processor location & naming:** processors live in `src/modules/{module}/infrastructure/messaging/listeners/` and are named `XxxProcessor` (e.g. `UserEventProcessor`). The inbound event shapes the consumer relies on live in `infrastructure/messaging/events/` of the consuming module (so the consumer does not import the producer's domain layer).

**Example: `AuthEmailVerifiedEvent` (auth) → `user` module marks the email verified**

```typescript
// src/modules/user/infrastructure/messaging/listeners/user-events.processor.ts

@Processor('user-events')
export class UserEventProcessor extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) { super(); }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === AuthEmailVerifiedEvent.eventName) {
      const payload = job.data.payload as AuthEmailVerifiedEvent['payload'];
      await this.commandBus.execute(
        new MarkEmailVerifiedCommand({ userId: payload.userId }),
      );
    }
  }
}
```

**Example: membership creation is owned by the `org` module.** `OrganizationInvitationAcceptedEvent` and `TeacherApplicationApprovedEvent` are both routed to `org-events` and consumed by the org module's own `OrganizationEventProcessor`, which dispatches the org module's command that creates the `OrganizationMembership`:

```typescript
// src/modules/org/infrastructure/messaging/listeners/organization-events.processor.ts

@Processor('org-events')
export class OrganizationEventProcessor extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) { super(); }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'OrganizationInvitationAcceptedEvent':
      case 'TeacherApplicationApprovedEvent':
        // creates the OrganizationMembership inside the org module
        await this.commandBus.execute(/* org module command built from job.data.payload */);
        break;
    }
  }
}
```

---

### Pattern B — Shared Query Ports (for cross-module reads)

When a module needs to **read** data owned by another module, it uses a **Query Port** defined in `shared/application/port/`. This is the canonical pattern used in this codebase.

**How it works:**
1. Define an **abstract port class** + **response DTO** in `shared/application/port/`
2. The providing module implements the port as an adapter in its `infrastructure/` layer
3. The providing module registers and **exports** the adapter bound to the port token
4. The consuming module injects the **port interface** (abstract class)

```typescript
// Step 1: Port lives in shared — both modules can see it
// src/modules/shared/application/port/user-query.port.ts

export interface UserDTO {
  id: string;
  userType: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export abstract class IUserQueryPort {
  abstract getUserByEmail(email: string): Promise<UserDTO | null>;
  abstract getUserById(id: string): Promise<UserDTO | null>;
}
```

```typescript
// Step 2: UserModule provides the implementation
// src/modules/user/infrastructure/repository/user-query.adapter.ts

@Injectable()
export class UserQueryAdapter implements IUserQueryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByEmail(email: string): Promise<UserDTO | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? { id: user.id, email: user.email, ... } : null;
  }

  async getUserById(id: string): Promise<UserDTO | null> { ... }
}
```

```typescript
// Step 3: UserModule exports the adapter bound to the port token
@Module({
  providers: [
    { provide: IUserQueryPort, useClass: UserQueryAdapter },
  ],
  exports: [IUserQueryPort],  // ← export the PORT TOKEN, not the adapter class
})
export class UserModule {}
```

```typescript
// Step 4: AuthModule imports UserModule and injects the port
@CommandHandler(LoginCommand)
export class LoginHandler {
  constructor(
    private readonly userQuery: IUserQueryPort,  // ← port, not adapter
    private readonly sessionRepo: ISessionRepository,
  ) {}

  async execute(command: LoginCommand) {
    const user = await this.userQuery.getUserByEmail(command.email);
    // ...
  }
}
```

**When to use which pattern:**

| Scenario | Pattern |
|---|---|
| Module A needs to **read** data owned by Module B | Pattern B (Query Port in `shared/application/port/`) |
| Module A needs to trigger a **write** in Module B | Pattern A (Domain Event via Outbox + BullMQ) — NEVER write cross-module directly |
| Module A needs to check org membership, teacher eligibility etc. | Pattern B (Query Port in `shared/application/port/`, implemented by the owning module) |
| Module A needs to trigger work in Module B immediately and synchronously | Reconsider your domain boundaries — this usually signals a design issue |

---

## 3. Dependency Injection Rules

### Rule 1: Only inject abstractions (interfaces/abstract classes) in the domain and application layers

```typescript
// ✅ Correct — depends on the interface
constructor(
  private readonly authAccountRepository: IAuthAccountRepository,
  private readonly passwordHashPort: IPasswordHashPort,
) {}

// ❌ Wrong — depends on the concrete implementation
constructor(
  private readonly authAccountRepository: PrismaAuthAccountRepository,
  private readonly passwordHashPort: BcryptPasswordHashAdapter,
) {}
```

### Rule 2: Concrete bindings only in the NestJS module file

The module file (`xxx.module.ts`) is the ONLY place where `useClass`, `useValue`, or `useFactory` should appear. This is your Composition Root.

```typescript
// ✅ Correct — module is the composition root
@Module({
  providers: [
    { provide: IAuthAccountRepository, useClass: PrismaAuthAccountRepository },
    { provide: IPasswordHashPort, useClass: BcryptPasswordHashAdapter },
    { provide: ITokenPort, useClass: JwtTokenAdapter },
  ],
})
export class AuthModule {}
```

### Rule 3: Cross-module exports — only port tokens and shared services

A module's `exports` array should contain ONLY:
- Port interface tokens (so other modules can inject them — see Pattern B, Shared Query Ports)
- Shared services (PrismaService, RedisService from SharedModule)

```typescript
// ✅ Correct exports
exports: [
  IUserQueryPort,        // ← port token: so auth module can inject it
  PrismaService,         // ← shared infrastructure service
]

// ❌ Wrong exports
exports: [
  PrismaUserRepository,  // ← never export repository implementations
  UserMapper,            // ← never export infrastructure mappers
  CreateUserHandler,     // ← never export application handlers
]
```

### Rule 4: No circular imports

If Module A imports Module B and Module B imports Module A, you have a circular dependency. Resolve this by:
1. Extracting the shared data into a third module (SharedModule pattern)
2. Using event-driven communication (Pattern A) instead of direct import
3. Re-evaluating your bounded context — the two modules might need to merge

### Rule 5: Infrastructure services (Prisma, Redis) live in SharedModule and are re-exported

```typescript
// SharedModule is @Global() — once imported in AppModule, PrismaService
// and RedisService are available everywhere without explicit import.
// Your BullMqModule is already @Global().
```

### Rule 6: Never use `forwardRef` — it is a code smell

If you need `forwardRef`, your boundaries are wrong. Use events or a shared Query Port instead.

---

## 4. Domain Error Hierarchy

Each module defines its own error namespace. All domain errors extend a shared base:

```typescript
// src/modules/shared/domain/errors/domain-error.ts

abstract class DomainError extends Error {
  abstract readonly code: string;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Invariant violated (business rule broken)
class InvariantError extends DomainError {
  readonly code = 'INVARIANT_VIOLATION';
}

// Conflict (e.g. duplicate slot, already suspended)
class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
}

// Not found (used when domain logic depends on existence)
class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
}

// Business rule violation (slightly softer than invariant)
class BusinessRuleViolationError extends DomainError {
  readonly code = 'BUSINESS_RULE_VIOLATION';
}
```

Each module extends these:
```typescript
// src/modules/classroom/domain/errors/classroom.errors.ts

class ClassroomInvariantError extends InvariantError {}
class SlotConflictError extends ConflictError {
  constructor(dayOfWeek: number, startTime: string) {
    super(`Slot conflict on day ${dayOfWeek} at ${startTime}`);
  }
}
class LessonNotScheduledError extends BusinessRuleViolationError {
  constructor() { super('Cannot start a lesson that is not in SCHEDULED state'); }
}
```

---

## 5. Repository Base Pattern (from codebase)

The `PrismaBaseRepository` already handles the full save + outbox transaction. Every new repository:

```typescript
// ✅ Pattern for a new repository implementation
// src/modules/classroom/infrastructure/repository/classroom.repository.adapter.ts

import { PrismaBaseRepository } from '@modules/shared';
import { IClassroomRepository } from '../../domain/repository/classroom.repository';
import { Classroom } from '../../domain/model/Classroom';
import { ClassroomId } from '../../domain/value-objects/classroom-id.vo';
import { PrismaClassroomRecord } from '@generated/prisma';
import { ClassroomMapper } from '../mappers/classroom.mapper';
import { PrismaService } from '@modules/shared';

@Injectable()
class PrismaClassroomRepository
  extends PrismaBaseRepository<ClassroomId, Classroom, PrismaClassroomRecord>
  implements IClassroomRepository
{
  constructor(prisma: PrismaService, mapper: ClassroomMapper) {
    super(prisma, mapper);
  }

  // PrismaBaseRepository needs this to know which Prisma model to use
  protected get delegate() {
    return this.prisma.classroom;
  }

  // Extra query methods beyond the base CRUD
  async findByOrg(orgId: string): Promise<Classroom[]> {
    const records = await this.prisma.classroom.findMany({
      where: { orgId },
    });
    return records.map((r) => this.mapper.toDomain(r));
  }
}

export { PrismaClassroomRepository };
```

**Note on the `save()` method:** The base `PrismaBaseRepository.save()` already:
1. Calls `mapper.toPersistence(entity)` to get the DB record shape
2. Calls `entity.pullDomainEvents()` to extract pending events
3. Writes the domain record + all outbox messages in ONE Prisma `$transaction`
4. This means domain events are atomically guaranteed — they can NEVER be lost

---

## 6. Domain Event Pattern (from codebase)

```typescript
// ✅ Pattern for a new domain event — follows existing AuthAccountCreatedEvent style

// src/modules/classroom/domain/events/lesson-started.event.ts
import { BaseDomainEvent } from '@modules/shared';

class LessonStartedEvent extends BaseDomainEvent<LessonStartedEvent.Payload> {
  constructor(
    aggregateId: string,        // lesson ID
    payload: LessonStartedEvent.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId,
      eventName: LessonStartedEvent.name,   // "LessonStartedEvent" — used in OUTBOX_EVENT_ROUTES
      payload,
      correlationId,
    });
  }
}

namespace LessonStartedEvent {
  export class Payload {
    constructor(
      public readonly lessonId: string,
      public readonly orgId: string,
      public readonly classroomId: string,
      public readonly teacherId: string,
      public readonly scheduledAt: Date,
    ) {}
  }
}

export { LessonStartedEvent };
```

After creating the event, register it in `OUTBOX_EVENT_ROUTES`. The target design is a fan-out map (`Map<string, string[]>`, one event → one or more queues). The code today is still `Map<string, string>` (one queue per event), so the fan-out change to `OutboxPublisherService` (one `queue.add(...)` per queue, same `jobId`) is planned work:
```typescript
// src/modules/shared/infrastructure/outbox/outbox-event-routes.ts
const OUTBOX_EVENT_ROUTES = new Map<string, string[]>([
  ['AuthAccountCreatedEvent', ['user-events']],
  ['AccountSuspendedEvent',   ['user-events']],
  ['UserCreatedEvent',        ['auth-events']],
  ['UserUpdatedEvent',        ['auth-events']],
  // Add new events here:
  ['LessonStartedEvent',      ['notification-events', 'classroom-events']],
  ['LessonCompletedEvent',    ['assessment-events', 'notification-events']],
  ['LessonReportedEvent',     ['progress-events']],
  // ...
]);
```

And register the queue in `OutboxPublisherService` and `BullMqModule`.
