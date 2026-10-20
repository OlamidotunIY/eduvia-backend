---
name: eduvia-module-workflow
description: >-
  Master workflow skill for building an Eduvia DDD / Clean Architecture backend module end-to-end from documentation:
  audits docs for inconsistencies, scaffolds 4 layers, builds domain/infra/app/presentation components via granular skills,
  wires shared query ports and BullMQ outbox events, validates cross-module data dependencies, runs tests, and commits.
---

# Eduvia Module Workflow — End-to-End Guide

This skill orchestrates the end-to-end creation, implementation, and verification of a module in Eduvia according to strict DDD, Clean Architecture, and multi-tenant operational guidelines.

---

## Non-Negotiable Architectural Principles

1. **Strict 4 Layers Only**:
   - `domain/`: Pure business logic (Aggregates, Entities, Value Objects, Domain Events, Domain Errors, Repository/Port Interfaces). Framework-agnostic.
   - `application/`: CQRS Commands and Queries with thin handlers orchestrating domain logic. No Prisma, no HTTP decorators.
   - `infrastructure/`: Prisma schemas, repository adapters, mappers, BullMQ event processors, service port adapters.
   - `presentation/`: Controllers, DTOs, and thin presentation services dispatching to `CommandBus` / `QueryBus`.
2. **Shared Query Ports are Strictly READ-ONLY**:
   - Stored in `src/modules/shared/application/port/<module>-query.port.ts`.
   - **ZERO WRITE METHODS** allowed (`save`, `create`, `update`, `delete`, `set`, etc. are forbidden).
3. **All Cross-Module Writes are Asynchronous**:
   - A module NEVER directly mutates data or calls command handlers in another module.
   - Flow: `Module A Aggregate emits DomainEvent -> OutboxMessage -> BullMQ -> Module B EventProcessor -> CommandBus.execute()`.
   - Sagas and reconciliation workflows must be asynchronous and idempotent.
4. **Outbox Atomicity**:
   - `PrismaBaseRepository.save(entity)` atomically saves the aggregate record and all emitted domain events into `OutboxMessage` in a single `$transaction`.
5. **Typed IDs**:
   - All aggregate and entity IDs extend `BaseEntityId` with UUIDv7 validation.

---

## Phase 0: Requirements Extraction & Documentation Audit

Before writing code:
1. Locate the module specification document in `docs/` (e.g. `docs/03-classroom-scheduling.md`, `docs/00-ddd-architecture.md`).
2. Run the doc consistency audit script:
   ```powershell
   pwsh -File .agents/skills/eduvia-module-workflow/scripts/Audit-Docs-Consistency.ps1 -Module "<module-name>"
   ```
3. **Spot and Resolve Document Inconsistencies**:
   - *URL routes*: Check if docs use `/orgs/` vs the canonical `/organizations/`.
   - *Storage*: Check if docs mention S3 (this codebase uses Firebase Storage for signed uploads).
   - *Cross-module write operations*: If doc suggests a direct method call across modules, convert it into an asynchronous domain event + BullMQ worker flow.
   - *Query port boundaries*: Ensure shared ports only expose query/read methods.

---

## Phase 1: Module Scaffolding

Scaffold the standard 4-layer structure, barrels, and aliases:
```powershell
pwsh -File .agents/skills/create-module/scripts/New-Module.ps1 -Module "<module-name>"
```
*Skills used:* [`create-module`](../create-module/SKILL.md)

---

## Phase 2: Domain Layer Implementation

Build the domain components in order:
1. **Typed IDs & Enums**:
   ```powershell
   pwsh -File .agents/skills/create-domain-valueobject/scripts/New-ValueObject.ps1 -Module "<module>" -Name "<Entity>Id" -IsTypedId
   pwsh -File .agents/skills/create-domain-valueobject/scripts/New-ValueObject.ps1 -Module "<module>" -Name "<Entity>Status" -IsEnum -EnumValuesJson '["active","paused"]'
   ```
   *Skills used:* [`create-domain-valueobject`](../create-domain-valueobject/SKILL.md)

2. **Domain Errors**:
   ```powershell
   pwsh -File .agents/skills/create-domain-error/scripts/New-DomainError.ps1 -Module "<module>" -ErrorName "<Name>InvariantError" -BaseError "ConflictError"
   ```
   *Skills used:* [`create-domain-error`](../create-domain-error/SKILL.md)

3. **Domain Events**:
   ```powershell
   pwsh -File .agents/skills/create-domain-event/scripts/New-DomainEvent.ps1 -Module "<module>" -EventName "<Entity>CreatedEvent" -TargetQueue "<module>-events"
   ```
   *Skills used:* [`create-domain-event`](../create-domain-event/SKILL.md)

4. **Aggregate Roots & Entities**:
   - Aggregate Roots (`domain/model/<Name>.ts`): private constructor, `create()`, `reconstitute()`, `touch()`.
   - Child Entities (`domain/entities/<name>.entity.ts`): encapsulated inside the aggregate root.
   ```powershell
   pwsh -File .agents/skills/create-domain-entity/scripts/New-DomainEntity.ps1 -Module "<module>" -EntityName "<Name>" -IsAggregateRoot
   ```
   *Skills used:* [`create-domain-entity`](../create-domain-entity/SKILL.md)

5. **Repository Interfaces & Domain Ports**:
   ```powershell
   pwsh -File .agents/skills/create-domain-repository/scripts/New-DomainRepository.ps1 -Module "<module>" -InterfaceName "I<Name>Repository" -EntityName "<Name>"
   ```
   *Skills used:* [`create-domain-repository`](../create-domain-repository/SKILL.md), [`create-domain-port`](../create-domain-port/SKILL.md)

---

## Phase 3: Infrastructure Persistence Layer

1. **Prisma Model**:
   Define the model in `prisma/schema/<module>.prisma`:
   ```powershell
   pwsh -File .agents/skills/create-prisma-model/scripts/New-PrismaModel.ps1 -Module "<module>" -ModelName "<Name>"
   ```
   *Skills used:* [`create-prisma-model`](../create-prisma-model/SKILL.md)

2. **Prisma Mapper**:
   Map between Prisma records and domain aggregates via `reconstitute()`:
   ```powershell
   pwsh -File .agents/skills/create-domain-mapper/scripts/New-DomainMapper.ps1 -Module "<module>" -MapperName "<Name>Mapper" -DomainEntity "<Name>" -PrismaRecord "<Name>"
   ```
   *Skills used:* [`create-domain-mapper`](../create-domain-mapper/SKILL.md)

3. **Repository Adapter**:
   Extend `PrismaBaseRepository<TId, TDomain, TRecord>`:
   ```powershell
   pwsh -File .agents/skills/create-repository-adapter/scripts/New-RepositoryAdapter.ps1 -Module "<module>" -AdapterName "Prisma<Name>Repository" -InterfaceName "I<Name>Repository" -DomainEntity "<Name>" -PrismaModel "<Name>"
   ```
   *Skills used:* [`create-repository-adapter`](../create-repository-adapter/SKILL.md)

---

## Phase 4: Application Layer Implementation

1. **Commands & Handlers**:
   ```powershell
   pwsh -File .agents/skills/create-application-command/scripts/New-ApplicationCommand.ps1 -Module "<module>" -CommandName "Create<Name>Command" -RepositoryInterface "I<Name>Repository"
   ```
   *Skills used:* [`create-application-command`](../create-application-command/SKILL.md)

2. **Queries & Handlers**:
   ```powershell
   pwsh -File .agents/skills/create-application-query/scripts/New-ApplicationQuery.ps1 -Module "<module>" -QueryName "Get<Name>ByIdQuery" -RepositoryInterface "I<Name>Repository"
   ```
   *Skills used:* [`create-application-query`](../create-application-query/SKILL.md)

---

## Phase 5: Infrastructure Messaging & Shared Ports

1. **BullMQ Listeners**:
   Handle incoming events asynchronously and dispatch local commands:
   ```powershell
   pwsh -File .agents/skills/create-bullmq-listener/scripts/New-BullmqListener.ps1 -Module "<module>" -ProcessorName "<Name>EventProcessor"
   ```
   *Skills used:* [`create-bullmq-listener`](../create-bullmq-listener/SKILL.md)

2. **Shared Query Ports (Read-Only)**:
   If other modules need to read data from this module:
   ```powershell
   pwsh -File .agents/skills/create-shared-query-port/scripts/New-SharedQueryPort.ps1 -Module "<module>" -PortName "I<Name>QueryPort"
   pwsh -File .agents/skills/create-query-port-adapter/scripts/New-QueryPortAdapter.ps1 -Module "<module>" -AdapterName "<Name>QueryAdapter" -PortName "I<Name>QueryPort" -DtoName "<Name>DTO" -RepositoryInterface "I<Name>Repository"
   ```
   *Skills used:* [`create-shared-query-port`](../create-shared-query-port/SKILL.md), [`create-query-port-adapter`](../create-query-port-adapter/SKILL.md)

---

## Phase 6: Presentation Layer Implementation

1. **DTOs & Controller**:
   ```powershell
   pwsh -File .agents/skills/create-presentation-dto/scripts/New-PresentationDto.ps1 -Module "<module>" -DtoName "Create<Name>Dto"
   pwsh -File .agents/skills/create-controller/scripts/New-Controller.ps1 -Module "<module>" -ControllerName "<Name>Controller"
   ```
   *Skills used:* [`create-presentation-dto`](../create-presentation-dto/SKILL.md), [`create-controller`](../create-controller/SKILL.md)

---

## Phase 7: NestJS Module Wiring

Wire the composition root:
```powershell
pwsh -File .agents/skills/create-nestjs-module/scripts/New-NestjsModule.ps1 -Module "<module>"
```
*Skills used:* [`create-nestjs-module`](../create-nestjs-module/SKILL.md)

---

## Phase 8: Verification, Testing & Cross-Module Contract Audit

1. **Architecture Audit**:
   ```powershell
   pwsh -File .agents/skills/audit-module/scripts/Audit-Module.ps1 -Module "<module>"
   ```
2. **Cross-Module Data Dependency Verification**:
   Verify that every other module this module needs data from is actually providing and saving the right data:
   ```powershell
   pwsh -File .agents/skills/eduvia-module-workflow/scripts/Verify-Cross-Module-Data.ps1 -Module "<module>" -RequiredPorts @("IUserQueryPort","IOrganizationQueryPort") -ConsumedEvents @("AuthEmailVerifiedEvent")
   ```
3. **Compile & Lint**:
   ```powershell
   pnpm run lint
   pnpm build
   ```
4. **Unit Tests**:
   ```powershell
   pnpm test
   ```

---

## Phase 9: Safe Git Commit

When all checks, tests, and cross-module audits pass:
```powershell
git add src/modules/<module> prisma/schema/<module>.prisma src/modules/shared/
git commit -m "feat(<module>): implement <module> vertical slice end-to-end"
```
