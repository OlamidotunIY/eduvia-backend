---
name: create-domain-entity
description: >-
  Creates a DDD Aggregate Root in domain/model/<Name>.ts or a child Entity in domain/entities/<kebab-name>.entity.ts,
  enforcing private constructors, create/reconstitute factories, getters, touch() mutation tracking, and typed IDs.
---

# Create Domain Entity Skill

Use this skill when building domain models (Aggregate Roots or nested Entities) based on the module specifications.

## Architectural Rules
1. **Aggregate Root**:
   - Stored in `domain/model/<Name>.ts` with **PascalCase** filename.
   - Extends `AggregateRoot<TId>` from `@modules/shared`.
   - Constructor is ALWAYS `private`.
   - Has `static create(...)` (emits domain event via `this.addDomainEvent`) and `static reconstitute(...)` (no events).
   - Exposes state via `get` accessors only — NO public setters.
   - Mutation methods enforce invariants and call `touch()` (`this._updatedAt = new Date()`).
2. **Child Entity**:
   - Stored in `domain/entities/<kebab-name>.entity.ts`.
   - Does NOT extend `AggregateRoot`.
   - Lives inside an aggregate root; saved via the aggregate root.
   - Cannot emit domain events directly.

## Generation Script

Run the PowerShell generator:

```powershell
# For an Aggregate Root:
pwsh -File .agents/skills/create-domain-entity/scripts/New-DomainEntity.ps1 `
  -Module "classroom" `
  -EntityName "Classroom" `
  -IsAggregateRoot `
  -IdType "ClassroomId" `
  -FieldsJson '[{"name":"orgId","type":"string","isPublic":true},{"name":"name","type":"string","isPublic":false}]'

# For a Child Entity:
pwsh -File .agents/skills/create-domain-entity/scripts/New-DomainEntity.ps1 `
  -Module "classroom" `
  -EntityName "AvailabilitySlot" `
  -IdType "AvailabilitySlotId" `
  -FieldsJson '[{"name":"dayOfWeek","type":"number","isPublic":false},{"name":"startTime","type":"string","isPublic":false}]'
```

## Verification
- Inspect generated file in `domain/model/` or `domain/entities/`.
- Ensure export is added to `domain/model/index.ts` or `domain/entities/index.ts`.
- Check that constructor is private and static factories exist.
