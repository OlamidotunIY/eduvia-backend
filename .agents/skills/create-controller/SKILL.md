---
name: create-controller
description: >-
  Creates a presentation Controller in presentation/controllers/<kebab-name>.controller.ts and a thin
  orchestrator Presentation Service in presentation/services/<kebab-name>.service.ts dispatching to CommandBus/QueryBus.
---

# Create Controller Skill

Use this skill when exposing HTTP REST endpoints for a module.

## Architectural Rules
1. Controllers live in `presentation/controllers/<kebab-name>.controller.ts`.
2. Controllers MUST inject the thin **presentation service** (`presentation/services/`) — NEVER `CommandBus` or repositories directly.
3. Use `@CurrentUser()` from `@modules/shared` to extract authenticated JWT token payload.
4. Use `@CorrelationId()` from `@modules/shared` to capture request correlation ID.
5. Protect endpoints using `@UseGuards(AuthGuard)`.
6. Routes must be named accurately according to documentation (plural resources, e.g. `classrooms`).

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-controller/scripts/New-Controller.ps1 `
  -Module "classroom" `
  -ControllerName "ClassroomController" `
  -RoutePrefix "classrooms"
```

## Verification
- Inspect generated files in `presentation/controllers/` and `presentation/services/`.
- Ensure exports are updated in `presentation/controllers/index.ts` and `presentation/services/index.ts`.
- Ensure controller and service are registered in `<module>.module.ts`.
