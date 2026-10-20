---
name: create-domain-valueobject
description: >-
  Creates typed IDs extending BaseEntityId (UUIDv7-backed), rich immutable domain value objects with invariant
  validation and equality, or domain enum types in domain/value-objects/<kebab-name>.vo.ts.
---

# Create Domain Value Object Skill

Use this skill to generate typed entity IDs, domain enums, or rich immutable value objects.

## Architectural Rules
1. **Typed IDs**:
   - MUST extend `BaseEntityId` from `@modules/shared`.
   - Private constructor.
   - Static `create()` calls `this.nextValue()` (generates UUIDv7).
   - Static `from(val)` re-hydrates existing string UUID.
2. **Business Value Objects**:
   - No ID, no identity.
   - Fully immutable after construction (`readonly` properties).
   - Invariant validation in static `create()` factory.
   - Value equality via `equals()` method.
3. **Naming**:
   - File naming: `<kebab-name>.vo.ts`.
   - Class naming: PascalCase (`ClassroomId`, `RecurrencePattern`, `LessonStatus`).

## Generation Script

Run the PowerShell generator:

```powershell
# Typed ID:
pwsh -File .agents/skills/create-domain-valueobject/scripts/New-ValueObject.ps1 `
  -Module "classroom" `
  -Name "ClassroomId" `
  -IsTypedId

# Domain Enum:
pwsh -File .agents/skills/create-domain-valueobject/scripts/New-ValueObject.ps1 `
  -Module "classroom" `
  -Name "ClassroomStatus" `
  -IsEnum `
  -EnumValuesJson '["active","paused","closed"]'

# Rich Value Object:
pwsh -File .agents/skills/create-domain-valueobject/scripts/New-ValueObject.ps1 `
  -Module "classroom" `
  -Name "RecurrencePattern" `
  -FieldsJson '[{"name":"dayOfWeek","type":"number"},{"name":"startTime","type":"string"},{"name":"timezone","type":"string"}]'
```

## Verification
- Check generated file in `domain/value-objects/`.
- Ensure export is added to `domain/value-objects/index.ts`.
