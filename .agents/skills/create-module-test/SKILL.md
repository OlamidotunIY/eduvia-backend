---
name: create-module-test
description: >-
  Generates isolated unit test suites for Aggregate Roots, Value Objects, Command Handlers, and Query Handlers
  in <module>/test/<kebab-name>.spec.ts verifying invariants, domain events, and repository interactions.
---

# Create Module Test Skill

Use this skill when implementing automated tests for domain models, value objects, and application handlers.

## Architectural Rules
1. Domain unit tests test domain logic directly without starting NestJS runtime containers.
2. Verify:
   - `create()` validates invariants and throws expected domain errors.
   - `create()` emits the appropriate domain events.
   - `reconstitute()` re-hydrates state without emitting domain events.
   - Mutation methods enforce invariants and update timestamps.
   - Command handlers interact only through repository port mocks and call `save()`.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-module-test/scripts/New-ModuleTest.ps1 `
  -Module "classroom" `
  -TargetName "Classroom" `
  -TestType "Aggregate"
```

## Verification
- Run `pnpm test` to verify that all test suites pass.
