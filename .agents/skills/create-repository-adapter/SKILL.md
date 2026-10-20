---
name: create-repository-adapter
description: >-
  Creates a Prisma repository adapter extending PrismaBaseRepository<TId, TDomain, TRecord> in
  infrastructure/persistence/repository/<kebab-name>.repository.ts implementing the domain repository interface.
---

# Create Repository Adapter Skill

Use this skill when implementing persistence for domain aggregate roots using Prisma.

## Architectural Rules
1. Implementations live in `infrastructure/persistence/repository/<kebab-name>.repository.ts`.
2. Extends `PrismaBaseRepository<TId, TDomain, TPrismaRecord>` from `@modules/shared`.
3. Implements the domain repository interface `I<Name>Repository`.
4. Must implement `protected get delegate()` returning the Prisma model delegate (`this.prisma.<model>`).
5. `PrismaBaseRepository.save()` automatically handles the outbox transaction — NEVER bypass it or write custom transaction code for saving aggregates.
6. Bound to interface in `<module>.module.ts`:
   `{ provide: I<Name>Repository, useClass: Prisma<Name>Repository }`.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-repository-adapter/scripts/New-RepositoryAdapter.ps1 `
  -Module "classroom" `
  -AdapterName "PrismaClassroomRepository" `
  -InterfaceName "IClassroomRepository" `
  -DomainEntity "Classroom" `
  -PrismaModel "Classroom"
```

## Verification
- Inspect generated file in `infrastructure/persistence/repository/`.
- Ensure export is added to `infrastructure/persistence/repository/index.ts`.
- Verify provider binding in module definition.
