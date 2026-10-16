---
name: create-scheduler
description: >-
  Creates background scheduled cron tasks in infrastructure/scheduler/<kebab-name>.scheduler.ts for automated
  reconciliation, sweepers, or async saga retries.
---

# Create Scheduler Skill

Use this skill when implementing automated periodic maintenance, asynchronous reconciliation, or sweepers.

## Architectural Rules
1. Schedulers live in `infrastructure/scheduler/<kebab-name>.scheduler.ts`.
2. Annotated with `@Injectable()` and `@Cron(CronExpression.*)`.
3. Dispatches CQRS commands via `CommandBus` to perform actions — schedulers do not contain business logic.
4. Reconciliation workflows must be non-blocking and idempotent.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-scheduler/scripts/New-Scheduler.ps1 `
  -Module "classroom" `
  -SchedulerName "LessonNoShowSweeperScheduler" `
  -CronExpr "EVERY_5_MINUTES"
```

## Verification
- Inspect generated file in `infrastructure/scheduler/`.
- Register the scheduler in the module's providers list.
