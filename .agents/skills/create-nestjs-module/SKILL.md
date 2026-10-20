---
name: create-nestjs-module
description: >-
  Configures the module composition root (<module>.module.ts), binds port tokens to concrete adapters,
  registers BullMQ queues, controls module exports, and wires the module into AppModule.
---

# Create NestJS Module Skill

Use this skill when finalizing dependency injection and composition root wiring for a module.

## Architectural Rules
1. The module file (`<module>.module.ts`) is the **Composition Root**.
   `useClass` and `provide` tokens belong exclusively here.
2. Imports:
   - `CqrsModule`
   - `BullModule.registerQueue({ name: '<module>-events' })`
   - Any dependent modules providing shared query ports (e.g. `UserModule`).
3. Exports:
   - ONLY shared query port tokens (e.g. `IClassroomQueryPort`).
   - Shared infrastructure re-exports if needed.
   - NEVER export repositories, mappers, command handlers, or domain entities.
4. Forbidden:
   - `forwardRef` is strictly forbidden. If needed, decouple via shared query ports or async events.
5. Wire into `src/app.module.ts`.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-nestjs-module/scripts/New-NestjsModule.ps1 -Module "classroom"
```

## Verification
- Inspect `<module>.module.ts` and `src/app.module.ts`.
- Run `pnpm build` to verify DI compilation.
