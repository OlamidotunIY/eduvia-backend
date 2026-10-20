---
name: create-presentation-dto
description: >-
  Creates presentation HTTP request/response DTOs in presentation/dto/<kebab-name>.dto.ts for HTTP endpoints.
---

# Create Presentation DTO Skill

Use this skill when defining HTTP API contracts in the presentation layer.

## Architectural Rules
1. DTOs live in `presentation/dto/<kebab-name>.dto.ts`.
2. Validates user input before handing off to presentation orchestrator services.
3. Decoupled from internal domain entities.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-presentation-dto/scripts/New-PresentationDto.ps1 `
  -Module "classroom" `
  -DtoName "CreateClassroomDto" `
  -FieldsJson '[{"name":"name","type":"string"},{"name":"teacherId","type":"string"},{"name":"capacity","type":"number","isOptional":true}]'
```

## Verification
- Inspect generated file in `presentation/dto/`.
- Ensure export is added to `presentation/dto/index.ts`.
