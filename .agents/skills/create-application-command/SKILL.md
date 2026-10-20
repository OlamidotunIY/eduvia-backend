---
name: create-application-command
description: >-
  Creates CQRS Command, Handler, and Result in application/commands/<kebab-name>/, ensuring handlers depend only
  on repository interfaces, orchestrate domain models, and maintain outbox atomicity.
---

# Create Application Command Skill

Use this skill to implement business operations that mutate state within a bounded context.

## Architectural Rules
1. Commands extend `Command<TResult>` from `@nestjs/cqrs`.
2. Handlers are annotated with `@CommandHandler(CommandClass)` and implement `ICommandHandler<CommandClass, ResultClass>`.
3. Handlers MUST depend ONLY on abstractions (e.g. `IClassroomRepository`, `IUserQueryPort`) — NEVER concrete adapters or `PrismaService`.
4. Handlers MUST NOT contain database transaction logic or HTTP decorators.
5. Atomicity: State mutation and outbox domain events are committed atomically inside `PrismaBaseRepository.save(entity)`. Never bypass this.
6. Module-to-module writes are strictly asynchronous via Domain Events $\to$ Outbox $\to$ BullMQ. A command in Module A must never call a command in Module B.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-application-command/scripts/New-ApplicationCommand.ps1 `
  -Module "classroom" `
  -CommandName "CreateClassroomCommand" `
  -RepositoryInterface "IClassroomRepository" `
  -EntityName "Classroom" `
  -PayloadFieldsJson '[{"name":"orgId","type":"string"},{"name":"teacherId","type":"string"},{"name":"name","type":"string"}]' `
  -ResultFieldsJson '[{"name":"id","type":"string"}]'
```

## Verification
- Inspect files generated in `application/commands/<kebab-name>/`.
- Ensure exports are updated in `application/commands/index.ts`.
- Verify the handler is registered in the module's `CommandHandlers` array.
