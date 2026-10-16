---
name: create-prisma-model
description: >-
  Defines and appends a Prisma persistence model to prisma/schema/<module>.prisma following Eduvia conventions
  (@id @default(uuid()) @map("_id") and @@map("snake_case")), and runs prisma generate.
---

# Create Prisma Model Skill

Use this skill when defining persistence models in Prisma for a module.

## Architectural Rules
1. Each module has its own `prisma/schema/<module>.prisma` file.
2. All primary keys MUST use `@id @default(uuid()) @map("_id")`.
3. Table names MUST map to snake_case via `@@map("snake_case_table_name")`.
4. Include `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
5. After modifying schema, execute `pnpm prisma:generate` to regenerate `@generated/prisma` client bindings.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-prisma-model/scripts/New-PrismaModel.ps1 `
  -Module "classroom" `
  -ModelName "Classroom" `
  -TableName "classrooms" `
  -FieldsJson '[{"name":"orgId","type":"String"},{"name":"teacherId","type":"String"},{"name":"name","type":"String"},{"name":"status","type":"String","attributes":"@default(\"active\")"}]'
```

## Verification
- Verify the model exists in `prisma/schema/<module>.prisma`.
- Verify that `pnpm prisma:generate` succeeds and types exist under `@generated/prisma`.
