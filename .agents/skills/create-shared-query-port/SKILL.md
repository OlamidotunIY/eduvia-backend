---
name: create-shared-query-port
description: >-
  Creates a cross-module read-only query port in src/modules/shared/application/port/<kebab-name>-query.port.ts
  along with its response DTOs, strictly enforcing that shared ports contain ZERO write operations.
---

# Create Shared Query Port Skill

Use this skill when one module needs to read data owned by another module.

## Architectural Rules
1. Cross-module reads MUST use Query Ports located in `src/modules/shared/application/port/`.
2. **ZERO WRITE OPERATIONS**: Shared ports must NEVER have write methods (`create`, `update`, `save`, `delete`, `set`, etc.). All cross-module writes MUST occur asynchronously via Domain Events $\to$ Outbox $\to$ BullMQ.
3. Response DTOs live in the SAME file as the port interface.
4. The owning module provides the implementation (adapter) in its `infrastructure/` layer and registers/exports the port token.
5. Consuming modules inject the abstract class token.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-shared-query-port/scripts/New-SharedQueryPort.ps1 `
  -Module "org" `
  -PortName "IOrganizationQueryPort" `
  -DtoName "OrganizationDTO" `
  -DtoFieldsJson '[{"name":"id","type":"string"},{"name":"name","type":"string"},{"name":"slug","type":"string"},{"name":"status","type":"string"},{"name":"ownerId","type":"string"}]' `
  -MethodsJson '[{"name":"getOrganizationById","params":"id: string","returnType":"OrganizationDTO | null"},{"name":"getOrganizationBySlug","params":"slug: string","returnType":"OrganizationDTO | null"}]'
```

## Verification
- Verify the file is created in `src/modules/shared/application/port/`.
- Ensure export is added to `src/modules/shared/application/port/index.ts`.
- Ensure no write methods exist on the abstract class.
