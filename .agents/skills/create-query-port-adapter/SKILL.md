---
name: create-query-port-adapter
description: >-
  Implements a shared query port (I<Name>QueryPort) in infrastructure/services/<kebab-name>-query.adapter.ts
  fulfilling cross-module read requests by mapping internal state to shared DTOs.
---

# Create Query Port Adapter Skill

Use this skill when implementing a shared query port that allows other modules to query data owned by this module.

## Architectural Rules
1. Adapters live in `infrastructure/services/<kebab-name>-query.adapter.ts`.
2. Annotated with `@Injectable()`.
3. Implements the shared query port abstract class from `@modules/shared`.
4. Maps domain aggregates or database queries to the shared query DTO.
5. In the module composition file (`<module>.module.ts`):
   - Register provider: `{ provide: I<Name>QueryPort, useClass: <Name>QueryAdapter }`
   - Export token: `exports: [I<Name>QueryPort]`

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-query-port-adapter/scripts/New-QueryPortAdapter.ps1 `
  -Module "org" `
  -AdapterName "OrganizationQueryAdapter" `
  -PortName "IOrganizationQueryPort" `
  -DtoName "OrganizationDTO" `
  -RepositoryInterface "IOrganizationRepository"
```

## Verification
- Inspect generated file in `infrastructure/services/`.
- Ensure export is added to `infrastructure/services/index.ts`.
- Ensure `<module>.module.ts` binds and exports the port token.
