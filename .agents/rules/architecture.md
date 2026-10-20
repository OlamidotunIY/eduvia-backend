# Eduvia Backend — Architecture Rules

> These rules are **mandatory** and must be followed by every AI agent working on this codebase.
> Use the `auth` and `user` modules as the canonical reference implementation.

---

## 1. General App Structure

The backend is a **NestJS monolith** structured as domain-driven modules. Each module is a fully self-contained vertical slice following DDD layering. The tech stack is:

- **Framework:** NestJS + NestJS CQRS (`CommandBus`, `QueryBus`)
- **ORM:** Prisma (repository layer)
- **Queue:** BullMQ (async event relay via outbox)
- **Auth:** JWT (access + refresh tokens via `@nestjs/jwt`)
- **Language:** TypeScript (strict mode, ESM)

The root module structure is:

```
src/
  app.module.ts
  main.ts
  modules/
    shared/       ← global cross-cutting infrastructure
    auth/         ← authentication & credential management
    user/         ← user profiles & identity
    org/          ← organisations & memberships
    classroom/    ← scheduling & lessons (future)
    ...
```

---

## 2. What Goes in `shared/`

The `shared` module (`src/modules/shared`) is `@Global()`. It exports infrastructure and abstractions used **across all modules**. It is NOT a dumping ground.

### What BELONGS in `shared/`:

| Location | Contents |
|---|---|
| `shared/domain/model/` | `AggregateRoot` base class |
| `shared/domain/events/` | `BaseDomainEvent`, `DomainEvent` interface |
| `shared/domain/errors/` | `DomainError`, `BadRequestError`, `NotFoundError`, `ConflictError`, `BusinessRuleViolationError` |
| `shared/domain/value-object/` | `BaseEntityId`, `OutboxMessageId`, any globally shared VOs |
| `shared/domain/repository/` | `BaseRepository`, `PrismaBaseRepository`, `IMapper` interface |
| `shared/application/port/` | **Cross-module query ports** — abstract classes + their response DTOs (e.g. `IUserQueryPort`, `UserDTO`) |
| `shared/infrastructure/` | `PrismaService`, `RedisService`, `OutboxPublisherService`, outbox relay infra |
| `shared/presentation/` | Global NestJS guards (`JwtAuthGuard`), interceptors (`CorrelationIdInterceptor`), decorators (`@CurrentUser`, `@CorrelationId`) |

### What does NOT belong in `shared/`:

- Domain models, domain events, or domain errors specific to ONE module
- Command handlers, query handlers
- Module-specific repositories or mappers
- Business logic of any kind

---

## 3. Module Folder Structure

**Every module MUST follow this exact folder structure.** No deviation. Use `auth` and `user` as reference.

```
src/modules/<module-name>/
  <module-name>.module.ts     ← NestJS module (composition root)
  index.ts                    ← public barrel export

  domain/
    index.ts
    model/                    ← Aggregate Roots (PascalCase filenames)
      MyAggregate.ts
      index.ts
    entities/                 ← Entities nested inside aggregates (if any)
      my-child.entity.ts
    value-objects/            ← Typed IDs + domain value objects
      my-aggregate-id.vo.ts
      my-status.v0.ts
    events/                   ← Domain events
      my-aggregate-created.ts
      index.ts
    errors/                   ← Domain errors for this module
      my-invariant.error.ts
      index.ts
    repository/               ← Repository interfaces (ports)
      my-aggregate.repository.ts
    ports/                    ← Other domain ports (token port, otp port, etc.)
      my-port.ts

  application/
    index.ts                  ← exports all handlers
    commands/
      <command-name>/
        <command-name>.command.ts
        <command-name>.handler.ts
        <command-name>.result.ts   (optional)
        index.ts
    queries/
      <query-name>/
        <query-name>.query.payload.ts
        <query-name>.handler.ts
        index.ts
      index.ts

  infrastructure/
    index.ts
    persistence/              ← Prisma repository implementations + mappers
      repository/
        my-aggregate.repository.ts   (PrismaXxxRepository)
        index.ts
      mappers/
        my-aggregate.mapper.ts
        index.ts
    messaging/                ← BullMQ event listeners (workers)
      listeners/
        <module>-events.processor.ts
        index.ts
      events/                 ← Message shapes for incoming events
        some-event.event.ts
        index.ts
      index.ts
    services/                 ← Port implementations (adapters)
      my-port.adapter.ts
      index.ts

  presentation/
    index.ts
    controllers/
      my.controller.ts
      index.ts
    dto/
      my.dto.ts
      index.ts
    services/                 ← Thin orchestrator that calls CommandBus/QueryBus
      my.service.ts
      index.ts
```

### Strict folder naming rules:

- Module folder: `kebab-case` (e.g. `auth`, `user`, `org`)
- Aggregate Root files: `PascalCase.ts` (e.g. `AuthAccount.ts`, `Session.ts`)
- All other files: `kebab-case.type.ts` (e.g. `auth-account-id.vo.ts`, `login.handler.ts`)
- All folders: `kebab-case`

---

## 4. DDD Rules

### 4.1 Aggregate Root

- Extends `AggregateRoot<TId>` from `@modules/shared`
- Constructor is ALWAYS `private`
- Has two static factories: `create()` (new) and `reconstitute()` (from DB)
- Only Aggregate Roots emit domain events via `this.addDomainEvent(...)`
- `create()` must call `super(params.id)` — never assign `this.id` directly
- All state mutations go through behaviour methods — no public setters
- Exposes state via `get` accessors only
- Has a private `touch()` method that updates `this._updatedAt`
- Typed ID value object is the generic parameter (e.g. `AggregateRoot<SessionId>`)

```typescript
// ✅ Correct pattern
class Session extends AggregateRoot<SessionId> {
  private _token: string;

  private constructor(params: { id: SessionId; token: string; ... }) {
    super(params.id);  // ← always call super
    this._token = params.token;
  }

  static create(params: { id: SessionId; token: string; ... }): Session {
    const session = new Session(params);
    session.addDomainEvent(new SessionCreatedEvent(...));
    return session;
  }

  static reconstitute(params: { id: SessionId; token: string; ... }): Session {
    return new Session(params);  // ← no events emitted
  }

  get token(): string { return this._token; }
}
```

### 4.2 Entity (non-root)

- Does NOT extend `AggregateRoot`
- Has its own typed ID but is NOT independently persisted
- Lives inside an Aggregate Root — the aggregate saves it
- Cannot emit domain events
- Private constructor + `create()` + `reconstitute()` static factories

### 4.3 Value Object

- No ID, no identity
- Fully immutable after construction
- Equality by value (not reference)
- Validation in constructor or `create()` factory
- Typed IDs extend `BaseEntityId` and validate UUIDv7

### 4.4 Domain Errors

- All domain errors extend a shared base class from `shared/domain/errors/`
- Each module defines its own specific error classes in `domain/errors/`
- The `code` is automatically `this.constructor.name` (no manual code string needed)
- Errors can accept structured `details` for raw data (e.g. `{ id: rawValue }`)

```typescript
// ✅ Correct
import { ConflictError } from '@modules/shared';

class AuthAccountAlreadySuspendedError extends ConflictError {
  constructor() {
    super('AuthAccount is already suspended');
  }
}
```

### 4.5 Domain Events

- All domain events extend `BaseDomainEvent<TPayload>` from `@modules/shared`
- Payload is defined as a nested `namespace` + `class Payload`
- Event name is automatically the class name (used in `OUTBOX_EVENT_ROUTES`)
- After creating a new event, register it in `src/modules/shared/infrastructure/outbox/outbox-event-routes.ts`

### 4.6 Repository Pattern

- Repository interface lives in `domain/repository/`
- Implementation lives in `infrastructure/persistence/repository/`
- Implementations extend `PrismaBaseRepository<TId, TDomain, TPrismaRecord>` from `@modules/shared`
- Must implement `protected get delegate()` — returns the Prisma model delegate
- Custom query methods go directly on the class (no separate query object)
- `PrismaBaseRepository.save()` automatically handles the outbox transaction — never bypass it

```typescript
// ✅ Correct
@Injectable()
export class PrismaSessionRepository
  extends PrismaBaseRepository<SessionId, Session, PrismaSession>
  implements ISessionRepository
{
  constructor(protected readonly prisma: PrismaService, protected readonly sessionMapper: SessionMapper) {
    super(prisma, sessionMapper);
  }

  protected get delegate() { return this.prisma.session; }

  async findByToken(token: string): Promise<Session | null> { ... }
}
```

---

## 5. Cross-Module Communication Rules

### 5.1 NO direct cross-module writes

**A module MUST NEVER directly call a command handler, repository, or service from another module to perform a write.**

All cross-module state changes happen **asynchronously via domain events**:

```
Module A emits DomainEvent → saved to OutboxMessage (atomically with the write)
→ OutboxPublisherService relays to BullMQ
→ Module B's messaging/listeners/ processor handles it
→ Module B's CommandBus.execute() performs the write
```

### 5.2 Cross-module reads use Query Ports in `shared/`

When Module A needs to **read** data owned by Module B:

1. The port (abstract class + response DTO) is defined in **`shared/application/port/`**
2. Module B provides the implementation (adapter) in its own `infrastructure/` or `presentation/services/`
3. Module B registers this adapter in its NestJS module and **exports** it
4. Module A injects the **port interface** (abstract class), not the concrete adapter

```typescript
// shared/application/port/user-query.port.ts
export interface UserDTO {
  id: string; email: string; userType: string; ...
}

export abstract class IUserQueryPort {
  abstract getUserByEmail(email: string): Promise<UserDTO | null>;
  abstract getUserById(id: string): Promise<UserDTO | null>;
}
```

```typescript
// auth module injects the port — never the UserRepository directly
@CommandHandler(LoginCommand)
export class LoginHandler {
  constructor(
    private readonly userQuery: IUserQueryPort,   // ← port, not repo
    private readonly sessionRepo: ISessionRepository,
  ) {}
}
```

**Response types (DTOs) for query ports live in the same file as the port in `shared/application/port/`.**

### 5.3 No `forwardRef`

`forwardRef` is forbidden. If you need it, your boundaries are wrong. Use events or a query port.

### 5.4 Module exports

A module's `exports` array MUST only contain:
- Port abstract classes (so other modules can inject their implementations)
- Adapters that implement shared ports (e.g. `UserQueryAdapter` implementing `IUserQueryPort`)
- Shared infrastructure re-exports (e.g. `PrismaService` from `SharedModule`)

It MUST NOT export:
- Aggregate Roots or domain entities
- Repository implementations
- Command/query handlers
- Mappers

---

## 6. Application Layer Rules

- Handlers live in `application/commands/<command-name>/` or `application/queries/<query-name>/`
- Handlers use CQRS (`@CommandHandler`, `@QueryHandler`)
- Handlers depend on **interfaces** only — never concrete implementations
- No Prisma, no HTTP, no NestJS decorators in handlers
- No transactions in handlers — transactions live in the repository layer (`PrismaBaseRepository.save()`)
- `presentation/services/` is a thin NestJS service that just calls `CommandBus.execute()` or `QueryBus.execute()` — no business logic

---

## 7. Presentation Layer Rules

- Controllers live in `presentation/controllers/`
- DTOs live in `presentation/dto/`
- `presentation/services/` contains one thin orchestrator service per feature area
- Controllers inject the orchestrator service — never `CommandBus` directly
- Use `@CurrentUser()` from `@modules/shared` to get the JWT payload
- Use `@CorrelationId()` from `@modules/shared` to get the request correlation ID
- Use `JwtAuthGuard` from `@modules/shared` on protected routes
- Use `@Ip()` + `@Headers('user-agent')` for device fingerprinting (login, session creation)

---

## 8. Prisma Schema Rules

- Each module has its own `prisma/schema/<module>.prisma` file
- The shared outbox table lives in `prisma/schema/shared.prisma`
- All model IDs use `@id @default(uuid()) @map("_id")`
- Models use `@@map("snake_case_table_name")` for DB table names

---

## 9. Naming Conventions Summary

| Thing | Convention | Example |
|---|---|---|
| Module folder | `kebab-case` | `auth`, `user`, `org` |
| Aggregate Root file | `PascalCase.ts` | `AuthAccount.ts` |
| Entity file | `kebab-case.entity.ts` | `availability-slot.entity.ts` |
| Value Object file | `kebab-case.vo.ts` | `session-id.vo.ts` |
| Command file | `kebab-case.command.ts` | `login.command.ts` |
| Handler file | `kebab-case.handler.ts` | `login.handler.ts` |
| Repository interface file | `kebab-case.repository.ts` | `session.repository.ts` |
| Repository implementation | `Prisma<Name>Repository` | `PrismaSessionRepository` |
| Mapper | `<Name>Mapper` | `SessionMapper` |
| Port | `I<Name>Port` | `ITokenPort`, `IUserQueryPort` |
| Domain error | `<Name>Error` | `AuthAccountAlreadySuspendedError` |
| Domain event | `<Name>Event` | `AuthAccountCreatedEvent` |
| BullMQ processor | `<module>-events.processor.ts` | `auth-events.processor.ts` |
