---
name: implement-module-feature
description: >-
  Coordinates implementing an end-to-end vertical slice feature across Domain, Application, and Presentation
  layers for an existing aggregate.
---

# Implement Module Feature Skill

Use this skill when implementing a specific business use case or endpoint inside an existing module.

## Workflow
1. Check the documentation (`docs/0X-*.md`) for the feature requirements, DTO shapes, and event specifications.
2. Spot any inconsistencies between the feature docs and the existing codebase.
3. Add the domain method to the Aggregate Root (and any domain events or errors).
4. Run the feature slice generator:

```powershell
pwsh -File .agents/skills/implement-module-feature/scripts/Scaffold-FeatureSlice.ps1 `
  -Module "classroom" `
  -FeatureName "CancelLesson" `
  -AggregateName "Lesson"
```

5. Complete the command handler and presentation controller method.
6. Verify unit tests and build.
