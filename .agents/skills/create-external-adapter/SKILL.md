---
name: create-external-adapter
description: >-
  Creates an adapter in infrastructure/services/<kebab-name>.adapter.ts implementing an internal domain port
  with external third-party SDKs (e.g. video conferencing, Google Meet, Firebase Storage, Speakeasy).
---

# Create External Adapter Skill

Use this skill when implementing an adapter for external third-party infrastructure.

## Architectural Rules
1. Adapters live in `infrastructure/services/<kebab-name>.adapter.ts`.
2. Annotated with `@Injectable()`.
3. Implements the module's domain port interface defined in `domain/ports/`.
4. Keeps external library details encapsulated away from domain and application layers.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-external-adapter/scripts/New-ExternalAdapter.ps1 `
  -Module "classroom" `
  -AdapterName "GoogleMeetAdapter" `
  -PortName "IMeetingLinkPort"
```

## Verification
- Inspect generated file in `infrastructure/services/`.
- Ensure export is added to `infrastructure/services/index.ts`.
- Register the provider binding in `<module>.module.ts`.
