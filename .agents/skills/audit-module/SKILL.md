---
name: audit-module
description: >-
  Audits a module against DDD and Clean Architecture rules: validates 4-layer structure, domain purity,
  aggregate root encapsulation, shared query port read-only constraints, handler decoupling, and cross-module integrity.
---

# Audit Module Skill

Use this skill to audit an existing or newly-created module for compliance with all architectural and data integrity constraints.

## Checks Performed
1. **Strict 4 Layers**: Only `domain`, `application`, `infrastructure`, and `presentation` are allowed.
2. **Domain Layer Purity**: Zero imports from `infrastructure` or `presentation`. Framework-agnostic.
3. **Aggregate Root Rules**:
   - Stored in `domain/model/` with PascalCase filename.
   - Extends `AggregateRoot<TId>`.
   - Private or protected constructor.
   - Static `create()` and `reconstitute()` factories.
   - No public setters.
4. **Child Entity Rules**:
   - Stored in `domain/entities/`.
   - Must NOT extend `AggregateRoot`.
5. **Shared Query Ports**:
   - Ports in `src/modules/shared/application/port/` must contain ZERO write methods.
6. **Application Handlers**:
   - Zero direct PrismaService injections.
   - Zero presentation decorators.
7. **Module Composition**:
   - Zero `forwardRef()` usages.
   - Exports only shared port tokens.

## Execution

Run the audit script:

```powershell
pwsh -File .agents/skills/audit-module/scripts/Audit-Module.ps1 -Module "classroom"
```

## Remediation
If errors are reported, consult the specific skill (e.g. `create-domain-entity`, `create-shared-query-port`) to remediate the violation before committing.
