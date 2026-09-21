# 11 — Platform Administration

> **Module:** `src/modules/platform-admin`
> **Status:** To build.
> **NestJS Module:** `PlatformAdminModule`

---

## Overview

The Platform Administration module gives Eduvia's super admins and curriculum editors the tools to:

- Manage and approve organizations
- Maintain the platform-wide curriculum graph
- Curate the platform question bank
- Monitor platform health and usage
- Manage AI prompt templates and cost
- Send platform-wide announcements
- Manage platform subjects and curriculum mappings

Super Admin is a platform-level role — not tied to any organization. Super Admins can view all org data, impersonate org users for support, and have access to all platform settings.

---

## Roles in this Module

| Role | Description |
|---|---|
| `PlatformSuperAdmin` | Full platform control — all operations |
| `CurriculumEditor` | Can create/update/deactivate curriculum nodes and platform questions |
| `PlatformSupport` | Read-only access to org data; can impersonate for support (Phase 2) |

---

## Domain Models

### 1. PlatformAdmin (Entity)

A platform-level user with elevated cross-org access.

```
PlatformAdmin
  id:        UUID
  userId:    UUID (FK -> User)
  role:      PlatformSuperAdmin | CurriculumEditor | PlatformSupport
  createdAt: DateTime
  updatedAt: DateTime
```

---

### 2. PlatformAnnouncement (Aggregate Root)

Platform-wide announcements displayed in all users' in-app notification feeds.

```
PlatformAnnouncement
  id:          UUID
  title:       string
  body:        string
  targetRoles: UserType[] (which user types receive this announcement — empty = all)
  status:      draft | scheduled | published | archived
  scheduledAt: DateTime? (when to auto-publish)
  publishedAt: DateTime?
  archivedAt:  DateTime?
  createdBy:   UUID (PlatformAdmin userId)
  createdAt:   DateTime
  updatedAt:   DateTime
```

**Domain Methods:**
- `PlatformAnnouncement.create(params)` — emits `AnnouncementCreatedEvent`
- `announcement.publish()` — status = published; emits `AnnouncementPublishedEvent` → sends to all target users
- `announcement.schedule(at)` — status = scheduled; cron triggers publish at `scheduledAt`
- `announcement.archive()` — status = archived

---

### 3. OrgApprovalRecord (Entity)

Tracks the approval/rejection of an organization by a super admin.

```
OrgApprovalRecord
  id:           UUID
  orgId:        UUID
  reviewedBy:   UUID (PlatformAdmin userId)
  decision:     approved | rejected
  reason:       string?
  reviewedAt:   DateTime
  createdAt:    DateTime
```

---

### 4. PlatformHealthMetric (Read Model)

Real-time platform health indicators. Rebuilt by monitoring cron.

```
PlatformHealthMetric
  snapshotAt:              DateTime
  totalOrgs:               int
  totalActiveOrgs:         int
  totalPendingApproval:    int
  totalUsers:              int
  totalActiveStudents:     int
  totalLessonsToday:       int
  totalLessonsThisMonth:   int
  totalRevenue:            { amount: int, currency: string }
  aiCostThisMonth:         { amount: float, currency: string }
  outboxQueueDepth:        int (PENDING outbox messages — system health indicator)
  bullmqQueueDepths:       { queue: string, waiting: int, active: int, failed: int }[]
  elasticsearchIndexHealth: string (green | yellow | red)
```

---

## Domain Events

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `AnnouncementPublishedEvent` | announcement.publish | announcementId, targetRoles, title, body | notification-events (batch notify all target users) |
| `OrgApprovedEvent` | OrgApprovalRecord (domain service) | orgId, approvedBy | org-events (set org.status = active), notification-events |
| `OrgRejectedEvent` | OrgApprovalRecord | orgId, rejectedBy, reason | notification-events (notify org owner) |

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| Only one pending approval record per org at a time | Unique constraint on `(orgId, decision=null)` |
| Curriculum nodes can only be deactivated — never deleted if they have questions or mastery records | `node.deactivate()` checks for linked questions and mastery records |
| Platform questions require super admin approval before publishing | `Question.publish()` for platform-level questions requires caller role = PlatformSuperAdmin |
| Platform announcements cannot be modified after publishing | `announcement.update()` throws if status = published |
| PlatformAdmin accounts are created by existing super admins only | Enforced in `CreatePlatformAdminCommand` handler |

---

## Business Actions

### Organization Management

| Action | Actor | Description |
|---|---|---|
| List pending org approvals | SuperAdmin | View orgs with `status = pending_approval` |
| Approve org | SuperAdmin | Sets org.status = active; sends approval notification to org owner |
| Reject org | SuperAdmin | Sets org.status = rejected with reason |
| Suspend org | SuperAdmin | Suspends org + locks premium features |
| Reactivate org | SuperAdmin | Restores suspended org |
| View org detail | SuperAdmin | Full view of any org including private data |

### Curriculum Management

| Action | Actor | Description |
|---|---|---|
| Create curriculum profile | SuperAdmin | Add a new national curriculum |
| Add curriculum node | SuperAdmin / CurriculumEditor | Add node at any level |
| Bulk import curriculum | SuperAdmin | CSV import of curriculum hierarchy |
| Update node | SuperAdmin / CurriculumEditor | Rename or update node |
| Deactivate node | SuperAdmin | Hide node + descendants |
| Create PlatformSubject | SuperAdmin | Define a standard subject |
| Map subject to curriculum | SuperAdmin | Link PlatformSubject to curriculum node |

### Platform Question Bank

| Action | Actor | Description |
|---|---|---|
| View all platform questions | SuperAdmin | Browse full platform question bank |
| Approve AI question for publishing | SuperAdmin | Approve AI-generated question for platform-level use |
| Create platform question | SuperAdmin / CurriculumEditor | Create a question owned by the platform (visible to all orgs) |
| Archive platform question | SuperAdmin | Remove question from circulation |

### Platform Announcements

| Action | Actor | Description |
|---|---|---|
| Create announcement | SuperAdmin | Draft platform-wide message |
| Schedule announcement | SuperAdmin | Set publish time |
| Publish immediately | SuperAdmin | Publish now — sends to all target users |
| Archive announcement | SuperAdmin | Remove from active feed |

### Platform Monitoring

| Action | Actor | Description |
|---|---|---|
| View platform health | SuperAdmin | Dashboard of platform health metrics |
| View org analytics (global) | SuperAdmin | Cross-org usage statistics |
| View AI cost summary | SuperAdmin | Token usage + cost breakdown per org and model |
| View outbox queue depth | SuperAdmin | Monitor outbox system health |
| View BullMQ queue status | SuperAdmin | Active, waiting, failed jobs per queue |

### Prompt Template Management

| Action | Actor | Description |
|---|---|---|
| List prompt templates | SuperAdmin | View all AI prompt template versions |
| Create template | SuperAdmin | Define a new prompt template |
| Activate template version | SuperAdmin | Set a version as active (deprecates previous) |
| Deprecate template | SuperAdmin | Mark a version as no longer usable |

---

## Platform Feature Flag System

Platform SaaS tier determines which features an org can access:

| Feature | Free | Starter | Professional | Enterprise |
|---|---|---|---|---|
| Max active students | 5 | 25 | 100 | Unlimited |
| Marketplace listing | No | Yes | Yes | Yes |
| AI features | No | Yes | Yes | Yes |
| Deep analytics | No | No | Yes | Yes |
| Priority support | No | No | Yes | Yes |
| Custom domain (Phase 2) | No | No | No | Yes |
| White-label branding (Phase 2) | No | No | No | Yes |
| API access (Phase 3) | No | No | No | Yes |

Feature checks use `OrgBillingAccount.planTier` at the guard level. No feature flag library needed — a simple `FeatureGuard` service resolves features from the tier.

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| PlatformAdmin | `IPlatformAdminRepository` | Global |
| PlatformAnnouncement | `IPlatformAnnouncementRepository` | Global |
| OrgApprovalRecord | `IOrgApprovalRecordRepository` | Global |

---

## Prisma Schema (To Add)

```prisma
// platform-admin.prisma

model PlatformAdmin {
  id        String   @id @db.Uuid
  userId    String   @unique @db.Uuid
  role      PlatformAdminRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum PlatformAdminRole { PlatformSuperAdmin CurriculumEditor PlatformSupport }

model PlatformAnnouncement {
  id          String   @id @db.Uuid
  title       String
  body        String
  targetRoles String[]
  status      AnnouncementStatus
  scheduledAt DateTime?
  publishedAt DateTime?
  archivedAt  DateTime?
  createdBy   String   @db.Uuid
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum AnnouncementStatus { draft scheduled published archived }

model OrgApprovalRecord {
  id         String   @id @db.Uuid
  orgId      String   @db.Uuid
  reviewedBy String   @db.Uuid
  decision   ApprovalDecision
  reason     String?
  reviewedAt DateTime
  createdAt  DateTime @default(now())
}

enum ApprovalDecision { approved rejected }
```

---

## API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /admin/orgs | SuperAdmin | List all orgs (filterable by status) |
| GET | /admin/orgs/:orgId | SuperAdmin | Get org detail (full view) |
| POST | /admin/orgs/:orgId/approve | SuperAdmin | Approve org |
| POST | /admin/orgs/:orgId/reject | SuperAdmin | Reject org with reason |
| POST | /admin/orgs/:orgId/suspend | SuperAdmin | Suspend org |
| POST | /admin/orgs/:orgId/reactivate | SuperAdmin | Reactivate org |
| GET | /admin/platform-admins | SuperAdmin | List platform admin accounts |
| POST | /admin/platform-admins | SuperAdmin | Create platform admin |
| GET | /admin/announcements | SuperAdmin | List announcements |
| POST | /admin/announcements | SuperAdmin | Create announcement |
| POST | /admin/announcements/:id/publish | SuperAdmin | Publish announcement |
| POST | /admin/announcements/:id/schedule | SuperAdmin | Schedule announcement |
| POST | /admin/announcements/:id/archive | SuperAdmin | Archive announcement |
| GET | /admin/health | SuperAdmin | Get platform health metrics |
| GET | /admin/analytics | SuperAdmin | Get cross-org platform analytics |
| GET | /admin/ai-costs | SuperAdmin | AI cost summary by org/model |
| GET | /admin/queues | SuperAdmin | BullMQ queue depths and health |
| POST | /admin/questions/:id/approve | SuperAdmin | Approve platform question for publishing |
