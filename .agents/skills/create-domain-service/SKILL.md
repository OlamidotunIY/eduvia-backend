---
name: create-domain-service
description: >-
  Creates pure domain services in domain/services/<kebab-name>.domain-service.ts for cross-aggregate business calculations
  with zero infrastructure or framework dependencies.
---

# Create Domain Service Skill

Use this skill when business calculations span multiple aggregates or don't fit naturally inside a single entity.

## Architectural Rules
1. Domain services contain pure business logic with NO side effects.
2. MUST NOT inject repositories, database services, HTTP clients, or framework decorators.
3. Operates strictly on domain models and value objects.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-domain-service/scripts/New-DomainService.ps1 `
  -Module "classroom" `
  -ServiceName "SlotCollisionDomainService" `
  -MethodsJson '[{"name":"detectConflicts","params":"existingSlots: AvailabilitySlot[], newSlot: AvailabilitySlot","returnType":"boolean"}]'
```

## Verification
- Inspect generated file in `domain/services/`.
- Ensure export is added to `domain/services/index.ts`.
