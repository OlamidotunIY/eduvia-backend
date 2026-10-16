---
name: create-bullmq-listener
description: >-
  Creates a BullMQ event processor in infrastructure/messaging/listeners/<kebab-name>.processor.ts to asynchronously
  consume domain events and dispatch internal CQRS commands (enforcing cross-module async write rules).
---

# Create BullMQ Listener Skill

Use this skill when handling inbound domain events from BullMQ queues.

## Architectural Rules
1. **NO direct cross-module writes**:
   A module MUST NEVER directly call a command handler, repository, or service of another module to mutate state.
   All cross-module state changes occur asynchronously:
   `Module A emits DomainEvent -> Outbox -> BullMQ -> Module B Processor -> CommandBus.execute()`
2. Processor classes:
   - Stored in `infrastructure/messaging/listeners/<module>-events.processor.ts`.
   - Annotated with `@Processor('<queue-name>')` and extend `WorkerHost`.
   - Injects `CommandBus` to dispatch local module commands.
   - Sagas and reconciliation workflows must be asynchronous.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-bullmq-listener/scripts/New-BullmqListener.ps1 `
  -Module "classroom" `
  -ProcessorName "ClassroomEventProcessor" `
  -QueueName "classroom-events" `
  -HandledEventsJson '[{"eventName":"TeacherApplicationApprovedEvent","commandName":"AssignInitialTeacherCommand"}]'
```

## Verification
- Inspect generated file in `infrastructure/messaging/listeners/`.
- Ensure export is added to `infrastructure/messaging/listeners/index.ts`.
- Register the processor in the module's `EventProcessors` array.
