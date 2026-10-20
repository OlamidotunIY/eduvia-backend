---
name: create-application-query
description: >-
  Creates CQRS Query, Handler, and DTO in application/queries/<kebab-name>/, ensuring handlers perform read-only
  operations, depend on repository interfaces, and return structured DTOs.
---

# Create Application Query Skill

Use this skill to implement read operations and data retrieval within a module.

## Architectural Rules
1. Queries extend `Query<TDTO>` from `@nestjs/cqrs`.
2. Handlers are annotated with `@QueryHandler(QueryClass)` and implement `IQueryHandler<QueryClass, DTOClass>`.
3. Queries are strictly READ-ONLY. Handlers must NEVER mutate aggregate state, call save, or emit domain events.
4. Returns clean, decoupled DTOs rather than exposing domain entities directly.
5. Injects repository interfaces or query port abstractions — never concrete Prisma implementations.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-application-query/scripts/New-ApplicationQuery.ps1 `
  -Module "classroom" `
  -QueryName "GetClassroomByIdQuery" `
  -RepositoryInterface "IClassroomRepository" `
  -DtoName "ClassroomDTO" `
  -PayloadFieldsJson '[{"name":"classroomId","type":"string"}]' `
  -DtoFieldsJson '[{"name":"id","type":"string"},{"name":"orgId","type":"string"},{"name":"name","type":"string"},{"name":"status","type":"string"},{"name":"createdAt","type":"Date"}]'
```

## Verification
- Inspect generated files in `application/queries/<kebab-name>/`.
- Ensure exports are updated in `application/queries/index.ts`.
- Verify the handler is registered in the module's `QueryHandlers` array.
