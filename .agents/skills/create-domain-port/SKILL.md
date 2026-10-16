---
name: create-domain-port
description: >-
  Creates an internal domain port abstract class in domain/ports/<kebab-name>.port.ts for external/infrastructure
  capabilities needed by domain/application logic (e.g. video conferencing, push notifications).
---

# Create Domain Port Skill

Use this skill when defining module-internal port contracts for external capabilities that the domain or application layer depends on.

## Architectural Rules
1. Domain ports are defined as abstract classes: `I<Name>Port`.
2. Stored in `domain/ports/<kebab-name>.port.ts`.
3. Never reference concrete third-party SDKs or libraries directly in domain ports.
4. Implementations (adapters) live in `infrastructure/services/<kebab-name>.adapter.ts`.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-domain-port/scripts/New-DomainPort.ps1 `
  -Module "classroom" `
  -PortName "IMeetingLinkPort" `
  -MethodsJson '[{"name":"createMeetingRoom","params":"lessonId: string, scheduledAt: Date","returnType":"{ roomUrl: string; hostKey?: string }"}]'
```

## Verification
- Inspect generated file in `domain/ports/`.
- Ensure export is added to `domain/ports/index.ts`.
