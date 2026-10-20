---
name: create-domain-mapper
description: >-
  Creates an IMapper<TDomain, TRecord> implementation in infrastructure/persistence/mappers/<kebab-name>.mapper.ts
  translating between Prisma DB records and Domain Aggregate/Entity instances via reconstitute().
---

# Create Domain Mapper Skill

Use this skill when mapping between database records (Prisma) and rich Domain Aggregates or Entities.

## Architectural Rules
1. Mappers live in `infrastructure/persistence/mappers/<kebab-name>.mapper.ts`.
2. Must implement `IMapper<TDomain, TRecord>` from `@modules/shared`.
3. Decorated with `@Injectable()`.
4. `toDomain(record)` MUST re-hydrate through `DomainClass.reconstitute(...)` without emitting new domain events.
5. `toPersistence(entity)` extracts state via entity getters and returns an object matching Prisma record shape (omitting `'id'`).

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-domain-mapper/scripts/New-DomainMapper.ps1 `
  -Module "classroom" `
  -MapperName "ClassroomMapper" `
  -DomainEntity "Classroom" `
  -PrismaRecord "Classroom" `
  -FieldMappingsJson '[{"domain":"orgId","persistence":"orgId"},{"domain":"teacherId","persistence":"teacherId"},{"domain":"name","persistence":"name"}]'
```

## Verification
- Check generated file in `infrastructure/persistence/mappers/`.
- Ensure export is added to `infrastructure/persistence/mappers/index.ts`.
- Verify registration in module providers list.
