---
name: create-cache-adapter
description: >-
  Creates a Redis caching adapter in infrastructure/services/<kebab-name>-cache.adapter.ts utilizing RedisService
  from @modules/shared for fast temporary caching and rate limiting.
---

# Create Cache Adapter Skill

Use this skill when caching temporary query data, rate limit counters, or session locks.

## Architectural Rules
1. Injects `RedisService` from `@modules/shared` (which is `@Global()`).
2. Encapsulates Redis serialization and key prefixing away from application/domain code.
3. Cache invalidation must be kept aligned with domain events.

## Generation Script

Run the PowerShell generator:

```powershell
pwsh -File .agents/skills/create-cache-adapter/scripts/New-CacheAdapter.ps1 `
  -Module "classroom" `
  -AdapterName "ClassroomCacheAdapter"
```

## Verification
- Inspect generated file in `infrastructure/services/`.
- Verify provider registration in `<module>.module.ts`.
