---
name: create-module
description: >-
  Scaffolds a new DDD / Clean Architecture module in src/modules/<module-name> with the canonical 4-layer
  folder structure, barrel files (index.ts), Prisma schema stub, and tsconfig path aliases.
---

# Create Module Skill

Use this skill when initiating a new vertical slice module in Eduvia.

## Architectural Rules
1. Every module strictly has 4 layers:
   - `domain/` (`model/`, `entities/`, `value-objects/`, `events/`, `errors/`, `repository/`, `ports/`)
   - `application/` (`commands/`, `queries/`)
   - `infrastructure/` (`persistence/repository/`, `persistence/mappers/`, `messaging/listeners/`, `messaging/events/`, `services/`)
   - `presentation/` (`controllers/`, `dto/`, `services/`)
2. Module folder must be `kebab-case` (e.g. `classroom`, `question-bank`).
3. Never create layers or top-level folders outside these 4 layers.

## Generation Script

Run the PowerShell scaffolder script:

```powershell
pwsh -File .agents/skills/create-module/scripts/New-Module.ps1 -Module <module-name>
```

### What It Generates
- Complete 4-layer directory tree with barrel files.
- `<module-name>.module.ts` composition root with CQRS and BullMQ queue registration.
- `index.ts` public re-export barrel.
- `prisma/schema/<module-name>.prisma` schema file.
- Automatically updates `tsconfig.json` path aliases (`@modules/<module-name>`).

## Verification
- Check that `src/modules/<module-name>` exists with all 4 layers.
- Check that `pnpm build` compiles cleanly.
