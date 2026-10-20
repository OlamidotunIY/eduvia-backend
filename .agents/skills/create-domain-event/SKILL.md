---
name: create-domain-event
description: >-
  Creates a Domain Event extending BaseDomainEvent with a nested Payload namespace in domain/events/<kebab-name>-event.ts,
  and optionally registers the event in OUTBOX_EVENT_ROUTES.
---

# Create Domain Event Skill

Use this skill when defining events that domain aggregate roots emit during state mutations.

## Architectural Rules
1. Domain events extend `BaseDomainEvent<TEvent.Payload>` from `@modules/shared`.
2. The payload is encapsulated in a nested `namespace <EventName>` with `export class Payload`.
3. Event name is derived automatically via `<EventName>.name` (used by BullMQ routing).
4. Atomicity: Aggregate roots emit events via `this.addDomainEvent(...)`. When `PrismaBaseRepository.save(entity)` is called, the repository atomically writes both the domain record and the outbox messages in a single transaction.
5. All outbound events must be mapped to their target BullMQ queue in `src/modules/shared/infrastructure/outbox/outbox-event-routes.ts`.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-domain-event/scripts/New-DomainEvent.ps1 `
  -Module "classroom" `
  -EventName "LessonStartedEvent" `
  -PayloadFieldsJson '[{"name":"lessonId","type":"string"},{"name":"orgId","type":"string"},{"name":"classroomId","type":"string"},{"name":"teacherId","type":"string"},{"name":"scheduledAt","type":"Date"}]' `
  -TargetQueue "classroom-events"
```

## Verification
- Inspect generated file in `domain/events/`.
- Ensure export is added to `domain/events/index.ts`.
- Verify that `OUTBOX_EVENT_ROUTES` in `outbox-event-routes.ts` maps the event to the correct queue.
