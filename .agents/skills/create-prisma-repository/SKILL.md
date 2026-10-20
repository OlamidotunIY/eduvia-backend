---
name: create-prisma-repository
description: >-
  Creates a Prisma repository adapter extending PrismaBaseRepository<TId, TDomain, TRecord> in
  infrastructure/persistence/repository/<kebab-name>.repository.ts implementing the domain repository interface.
---

# Create Prisma Repository Skill

Use this skill when generating Prisma-based repository implementations for domain aggregate roots.

## Architectural Rules
1. Extends `PrismaBaseRepository<TId, TDomain, TRecord>` from `@modules/shared`.
2. Must implement `protected get delegate()` returning the Prisma model delegate.
3. Automatically provides atomic save with outbox event persistence in one transaction.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-prisma-repository/scripts/New-PrismaRepository.ps1 `
  -Module "classroom" `
  -RepositoryName "PrismaClassroomRepository" `
  -DomainEntity "Classroom" `
  -PrismaModel "Classroom"
```

## Verification
- Inspect generated file in `infrastructure/persistence/repository/`.
- Ensure provider binding in `<module>.module.ts`.
