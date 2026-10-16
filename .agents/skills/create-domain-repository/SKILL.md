---
name: create-domain-repository
description: >-
  Creates a Domain Repository port interface extending BaseRepository<TDomain, TId> in
  domain/repository/<kebab-name>.repository.ts with domain-specific query contracts.
---

# Create Domain Repository Skill

Use this skill when defining persistence contracts required by the domain and application layers.

## Architectural Rules
1. Repository ports live in `domain/repository/<kebab-name>.repository.ts`.
2. Extends `BaseRepository<TDomain, TId>` from `@modules/shared` which provides `findById`, `findAll`, `save`, and `delete`.
3. Declared as an `abstract class` named `I<Name>Repository` (used as NestJS injection token).
4. MUST NOT reference Prisma, SQL, or infrastructure concepts.
5. Injected into Command and Query handlers via the abstract class token.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-domain-repository/scripts/New-DomainRepository.ps1 `
  -Module "classroom" `
  -InterfaceName "IClassroomRepository" `
  -EntityName "Classroom" `
  -MethodsJson '[{"name":"findByOrgId","params":"orgId: string","returnType":"Classroom[]"},{"name":"findByTeacherId","params":"teacherId: string","returnType":"Classroom[]"}]'
```

## Verification
- Check generated file in `domain/repository/`.
- Ensure export is added to `domain/repository/index.ts`.
