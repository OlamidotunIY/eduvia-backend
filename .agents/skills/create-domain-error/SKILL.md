---
name: create-domain-error
description: >-
  Creates strongly-typed domain error classes in domain/errors/<kebab-name>.error.ts extending shared error
  types (ConflictError, NotFoundError, BadRequestError, BusinessRuleViolationError).
---

# Create Domain Error Skill

Use this skill when defining domain-specific invariant violations and errors.

## Architectural Rules
1. Domain errors MUST extend a shared base class from `@modules/shared`:
   - `ConflictError`: State conflicts (e.g. `ClassroomAlreadyClosedError`, `SlotConflictError`).
   - `NotFoundError`: Entity missing during domain operations (e.g. `LessonNotFoundError`).
   - `BadRequestError`: Invalid parameter formats.
   - `BusinessRuleViolationError`: Violations of business invariants (e.g. `LessonNotScheduledError`).
2. Error code is automatically set to the constructor class name.
3. Constructors accept optional structured `details` for diagnostic info without leaking infrastructure details.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-domain-error/scripts/New-DomainError.ps1 `
  -Module "classroom" `
  -ErrorName "LessonNotScheduledError" `
  -BaseError "BusinessRuleViolationError" `
  -DefaultMessage "Cannot start a lesson that is not in SCHEDULED state"
```

## Verification
- Inspect generated file in `domain/errors/`.
- Ensure export is added to `domain/errors/index.ts`.
