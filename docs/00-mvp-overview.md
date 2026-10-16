# Eduvia — MVP Master Blueprint

> **Eduvia** is a curriculum-aware educational operating system for tutoring organizations serving international K-12 students. It is not a marketplace-first product — it is an operational platform that *happens* to have a marketplace surface. The primary unit of value is the **organization**, not the individual tutor.

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack (Actual)](#tech-stack-actual)
4. [Existing Codebase State](#existing-codebase-state)
5. [Layered Architecture Pattern](#layered-architecture-pattern)
6. [System-Wide Patterns](#system-wide-patterns)
7. [Domain Modules Index](#domain-modules-index)
8. [Cross-Domain Data Flow](#cross-domain-data-flow)
9. [WebSocket Architecture](#websocket-architecture)
10. [Event-Driven Architecture — Outbox + BullMQ](#event-driven-architecture)
11. [Multi-Tenancy Strategy](#multi-tenancy-strategy)
12. [MVP Scope & Roadmap](#mvp-scope--roadmap)

---

## Product Vision

Eduvia is an **educational operating system** that unifies scheduling, live teaching, assessment, curriculum awareness, progress intelligence, and billing into one coherent platform for tutoring organizations serving international K-12 students.

### Who Uses Eduvia

| Actor | How They Join | What They Do |
|---|---|---|
| **Parent** | Self-registers | Adds children, discovers orgs, manages billing |
| **Student** | Registered by parent (parent supplies email + password; student verifies email on first login) | Attends lessons, submits classwork/assignments, sees mastery map |
| **Teacher** | Self-registers, then invited by org admin OR applies via marketplace | Prepares lessons, teaches live, marks work, submits reports |
| **Teaching Assistant** | Invited by org admin | Limited access, assists in lessons |
| **Lead Teacher** | Promoted by Org Admin | Manages org curriculum resources, mentors teachers |
| **Org Admin** | Promoted by Org Owner | Manages org operations, teachers, scheduling, policies |
| **Org Owner** | A teacher who creates an org (auto-assigned) | Full org control |
| **Platform Super Admin** | Platform-level account | Manages curricula, question bank, org approvals, platform health |

### Core Differentiators

| Differentiator | Description |
|---|---|
| Curriculum Graph | Deep hierarchical graph of international curricula — resolved per student country and grade level |
| Learning Board | Real-time multi-mode collaborative workspace — Operational Transformation (OT) synced over WebSocket |
| Mastery Signals | Hybrid: teacher-assessed + system auto-calculated mastery per curriculum node |
| Org-First Model | Individual tutors must be org-affiliated; orgs are the primary unit |
| Parent Trust Loop | Structured lesson reports + AI-drafted summaries sent to parents after every lesson |
| Event-Driven Core | All side effects (notifications, mastery, billing) are async and auditable via Outbox + BullMQ |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  React Native Mobile App                  │
│              (Teachers · Parents · Students)              │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API + WebSocket (Socket.io)
┌─────────────────────▼───────────────────────────────────┐
│                NestJS Modular Monolith                    │
│  ┌──────┐ ┌──────┐ ┌──────────┐ ┌───────┐ ┌─────────┐  │
│  │ IAM  │ │ Org  │ │Classroom │ │ Board │ │  Assess │  │
│  │ Auth │ │ Mkt  │ │ Schedule │ │       │ │  ment   │  │
│  └──┬───┘ └──┬───┘ └────┬─────┘ └───┬───┘ └────┬────┘  │
│     └────────┴──────────┴───────────┴───────────┘        │
│                   NestJS CQRS Event Bus                   │
│  ┌──────────────────────────────────────────────────┐    │
│  │         MySQL / MariaDB (Primary Database)        │    │
│  │        Domain tables + outbox_messages            │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         │ Outbox Poller (@Cron, 5s)       │
│  ┌──────────────────────▼───────────────────────────┐    │
│  │             BullMQ (Redis-backed)                 │    │
│  │  auth-events · user-events · classroom-events...  │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
          │                               │
   Elasticsearch                  Socket.io + Redis Adapter
   (full-text search)             (real-time, namespaced rooms)
```

---

## Tech Stack (Actual)

Verified from package.json, module files, and Prisma schema:

| Layer | Technology | Notes |
|---|---|---|
| Framework | NestJS v12 | @nestjs/common, @nestjs/core, @nestjs/platform-express |
| CQRS | @nestjs/cqrs v12 | Commands, Queries, Event handlers |
| ORM | Prisma v7.10 | Multi-file schema in prisma/schema/*.prisma |
| Database | MySQL / MariaDB | via mariadb driver + @prisma/adapter-mariadb |
| Cache/Pub-Sub | Redis | via ioredis v6 |
| Job Queue | BullMQ v6 | @nestjs/bullmq wrapper |
| Scheduling | @nestjs/schedule | `@Cron` outbox poller |
| Auth - Hashing | bcrypt v6 | Password hashing (default 12 salt rounds) |
| Auth - JWT | @nestjs/jwt (jsonwebtoken v9) | Access tokens (JWT_SECRET) + opaque refresh tokens |
| Auth - TOTP | speakeasy v2 | Time-based OTP (2FA) |
| Observability | @nestjs/observe v0.1.8 | Distributed tracing, metrics, error telemetry |
| Linting | oxlint v1.58 | Fast Rust-based linter |
| Language | TypeScript v6 | Strict mode |
| Testing | Jest v30 + Supertest | Unit + E2E |
| Real-time | Socket.io | To add — with Redis adapter |
| Search | Elasticsearch | To add |
| Payments | Stripe Connect + PayPal | To add |
| AI | OpenAI (GPT-4o) / Gemini (`gemini-2.0-flash`) (abstracted port) | To add |
| Mobile | React Native | Separate repo |
| Push | Firebase Cloud Messaging (FCM) | To add |
| Email | Resend | To add |
| File Storage | Firebase Storage | To add (student image uploads, signed upload URLs) |
| Video | Zoom / Google Meet API | Link generation only — no owned video infra |

> **Prisma 7:** Uses multi-file schema (prisma/schema/*.prisma). Generator outputs to src/generated/prisma. Uses @prisma/adapter-mariadb driver adapter. MySQL has no partial unique indexes or native array columns: array-like fields are stored as `Json`, and "only one active X" rules are enforced in the application layer.

---

## Existing Codebase State

### What Is Already Built

| Module | Status | Detail |
|---|---|---|
| `auth` | Built | Account, Session, TwoFactor, Verification aggregates; CQRS: create auth account, login, logout, complete verification (OTP), resend OTP, request password reset, change password, revoke all sessions, get session |
| `user` | Built | User aggregate: create, update, suspend, mark email verified; register student (parent adds child); UserCreatedEvent, UserUpdatedEvent |
| `org` | Partially built | Domain entities built (Organization + OrganizationPolicy, OrganizationMembership, OrganizationSubject, OrganizationInvitation, TeacherApplication); commands: create organization, receive teacher application, invitation-accepted handling, update organization subject (events routed to `org-events`). Not yet built: approval/rejection flow, invitations API, marketplace search |
| `shared` | Built | AggregateRoot, DomainEvent base, OutboxMessage model, OutboxPublisherService (`@Cron` poller, every 5s), BullMQ module, Redis service, Prisma service, HTTP middleware, shared ports (`PasswordHashPort`, `UserQueryPort`) |

### What Needs to Be Built

| Module | Priority |
|---|---|
| Organization & Marketplace (remaining: approval, invitations, memberships, marketplace search) | P0 — MVP |
| Classroom & Scheduling | P0 — MVP |
| Learning Board | P0 — MVP |
| Question Bank & Assessment | P0 — MVP |
| Curriculum Graph | P0 — MVP |
| Progress & Reporting | P0 — MVP |
| Notifications & Messaging | P0 — MVP |
| Billing & Subscriptions | P0 — MVP |
| AI Features | P1 — MVP (core AI) |
| Platform Administration | P1 — MVP |

---

## Layered Architecture Pattern

Every new module MUST follow the DDD + CQRS pattern established by auth and user modules.

### Folder Structure Per Module

```
src/modules/{domain}/
  domain/
    model/           Aggregate roots (extend AggregateRoot<TId>)
    entities/        Non-root domain entities
    value-objects/   Immutable typed value objects
    events/          Domain events emitted by aggregates
    errors/          Domain-specific errors
    ports/           Interface contracts for infrastructure adapters
    repository/      Repository interface contracts (IXxxRepository)
  application/
    commands/        CQRS command + handler pairs (one folder per command)
    queries/         CQRS query + handler pairs (one folder per query)
  infrastructure/
    messaging/
      events/        Inbound event shapes consumed from BullMQ (payload contracts)
      listeners/     BullMQ processor classes (XxxProcessor, @Processor)
    repository/      Prisma implementations of IXxxRepository
    services/        Port adapter implementations
    mappers/         Prisma record <-> Domain model mappers
  presentation/
    controllers/     HTTP controllers (thin — validate DTO, dispatch command)
    dto/             Request/Response DTOs
    services/        Orchestration services (multi-command flows)
  {domain}.module.ts NestJS module — wires all providers
  index.ts           Public barrel export (port tokens + shared services only)
```

### Domain Rules

- Aggregates extend `AggregateRoot<TId>` from `@modules/shared`
- All state changes via domain methods — never external property mutation
- Domain methods enforce invariants, throw typed domain errors on violation
- Side effects are encoded as domain events via `addDomainEvent()` — never inline
- Value objects are immutable and carry validation in their constructor/factory

---

## System-Wide Patterns

### User Identity

```
User (global — not org-scoped)
  ├── userType: student | teacher | admin | parent
  ├── Account[] — credentials / OAuth provider accounts (password, tokens, scope)
  ├── Session[] — refresh token sessions
  ├── TwoFactor — TOTP secret + backup codes (when enabled)
  ├── Verification[] — OTP / email verification records
  ├── ParentProfile (when userType = parent)
  │     └── StudentProfile[] — children added by this parent
  │           └── linked to the child's own User (userType = student) via userId
  ├── TeacherProfile (when userType = teacher)
  └── OrganizationMembership[] (when userType = teacher)
        └── role: OrgOwner | OrgAdmin | LeadTeacher | Teacher | TeachingAssistant
```

### Curriculum Resolution Rule

A student has ONE curriculum, resolved from their country of residence and grade level:
```
StudentProfile.countryCode + StudentProfile.gradeLevel -> CurriculumProfile
  e.g. GB + Year 12–13 -> A-Level; GB + Year 1–11 -> England National Curriculum
```
Where the country/grade pair is ambiguous (e.g. IB, Ontario), the student must be given an explicit curriculum choice, stored on the student profile (`StudentProfile.curriculumId`, optional). All subjects the student takes fall under this single curriculum. There is no per-subject curriculum override.

### Classroom Model

```
Organization (org_id isolation boundary)
  └── Classroom (permanent educational channel for a subject)
        ├── primaryTeacher: OrganizationMembership
        ├── coverTeacher?: OrganizationMembership (for lesson-level overrides)
        ├── enrolledStudents: StudentEnrollment[]
        ├── subject: OrganizationSubject -> PlatformSubject -> CurriculumNode
        ├── recurrence: { dayOfWeek, startTime, timezone, intervalWeeks }
        └── lessons: Lesson[]
              └── LearningBoard (1:1, auto-created with lesson; found via LearningBoard.lessonId)
```

---

## Domain Modules Index

| # | Module | File |
|---|---|---|
| 00 | MVP Overview (this file) | 00-mvp-overview.md |
| 01 | IAM & Auth | 01-iam-auth.md |
| 02 | Organization & Marketplace | 02-org-marketplace.md |
| 03 | Classroom & Scheduling | 03-classroom-scheduling.md |
| 04 | Learning Board | 04-learning-board.md |
| 05 | Question Bank & Assessment | 05-question-bank-assessment.md |
| 06 | Curriculum Graph | 06-curriculum-graph.md |
| 07 | Progress & Reporting | 07-progress-reporting.md |
| 08 | Notifications & Messaging | 08-notifications-messaging.md |
| 09 | Billing & Subscriptions | 09-billing-subscriptions.md |
| 10 | AI Features | 10-ai-features.md |
| 11 | Platform Administration | 11-platform-admin.md |

---

## Cross-Domain Data Flow

### Lesson Lifecycle State Machine

```
PENDING -> SCHEDULED -> LIVE -> COMPLETED -> MARKING -> REPORTED -> ARCHIVED
```

| State | Trigger | Actor |
|---|---|---|
| PENDING | Generated from classroom recurrence pattern | System (cron) |
| SCHEDULED | Parent accepts booking / admin confirms (meeting is created now) | Parent / OrgAdmin |
| LIVE | Teacher starts session on the Learning Board (meeting link delivered now) | Teacher |
| COMPLETED | Lesson end time reached OR teacher ends session | System / Teacher |
| MARKING | Teacher enters marking mode on the board | Teacher |
| REPORTED | Teacher approves AI report draft and submits | Teacher |
| ARCHIVED | Report locked 7 days after submission | System |

Off-path states: `CANCELLED` (from PENDING/SCHEDULED; deletes the meeting), `STUDENT_NO_SHOW` (from LIVE, marked by the teacher after `noShowWaitMinutes`), `TEACHER_NO_SHOW` (from SCHEDULED, marked by an OrgAdmin or the student/parent after `noShowWaitMinutes` from `scheduledAt`). See [03-classroom-scheduling.md](03-classroom-scheduling.md).

### Cross-Domain Event Map (Planned)

Multi-queue lists assume the planned fan-out routing (see [Outbox + BullMQ Flow](#event-driven-architecture)).

| Event | Producer | Consumer Queues |
|---|---|---|
| AuthAccountCreatedEvent | auth | user-events |
| AuthEmailVerifiedEvent | auth | user-events |
| AuthVerificationCreatedEvent | auth | notification-events (planned — not routed in code yet) |
| AccountSuspendedEvent | auth | user-events |
| UserCreatedEvent | user | auth-events |
| UserUpdatedEvent | user | auth-events |
| OrganizationCreatedEvent | org | org-events, search-events |
| OrganizationInvitationAcceptedEvent | org | org-events (membership created by the org module) |
| TeacherApplicationReceivedEvent | org | notification-events |
| TeacherApplicationApprovedEvent | org | org-events (membership created by the org module), notification-events |
| LessonScheduledEvent | classroom | notification-events, billing-events, meet-events |
| LessonStartedEvent | classroom | notification-events, classroom-events |
| LessonCancelledEvent | classroom | notification-events, billing-events, meet-events |
| LessonCompletedEvent | classroom | assessment-events, notification-events |
| LessonReportSubmittedEvent | progress (report) | notification-events, classroom-events |
| LessonReportedEvent | classroom | progress-events |
| StudentResponseSubmittedEvent | board | assessment-events |
| AssessmentFinalizedEvent | assessment | ai-events (report summary trigger), progress-events |
| MasteryUpdatedEvent | assessment | progress-events, ai-events |
| SubscriptionCreatedEvent | billing | classroom-events |

---

## WebSocket Architecture

Socket.io with Redis adapter for horizontal scaling.

### Namespaces

| Namespace | Purpose | Who Connects |
|---|---|---|
| /lesson | Lesson state, presence, meet link delivery | Teacher + lesson students |
| /board | OT operations, mode changes, content sync | Teacher + board participants |
| /notifications | Real-time in-app notification delivery | All authenticated users |
| /chat | Messaging (student-teacher, parent-admin) | Per role permissions |

### Room Strategy

| Room Key | Members | Used For |
|---|---|---|
| user:{userId} | Single user (all devices) | Personal notifications |
| lesson:{lessonId} | Teacher + all students | Lesson state events |
| board:{boardId} | Teacher + participants | OT operations, mode changes |
| org:{orgId} | All org members | Org-wide broadcasts |
| classroom:{classroomId} | Teacher + enrolled students | Classroom announcements |

### Connection Protocol

```
1. Client connects with JWT in socket handshake: auth.token
2. Server guard validates JWT -> extracts { userId, userType, scope, sessionId }
   (access token claims: sub, userId, userType, scope, sessionId, jti, iat, exp — no orgId/role)
3. Server auto-joins client to room: user:{userId}
4. Client emits lesson:join or board:join with target ID (plus orgId where org context is needed)
5. Server validates OrganizationMembership / enrollment -> joins appropriate room
6. All WS messages carry: { event, payload, correlationId, sentAt }
```

---

## Event-Driven Architecture

### Outbox + BullMQ Flow (As Implemented)

```
API Handler receives request
  |
  DB Transaction:
    a. Domain mutation (e.g. lesson.complete())
    b. OutboxMessage written: { type, payload, status: PENDING }
  Transaction commits atomically
  |
OutboxPublisherService runs a @Cron job every 5s (@nestjs/schedule):
    SELECT * FROM outbox_messages WHERE status = PENDING LIMIT 50   // OUTBOX_PUBLISH_BATCH_SIZE
    For each message:
      OUTBOX_EVENT_ROUTES.get(message.type) -> queue name(s)
      for each queue: queue.add(message.type, payload, { jobId: message.id })  // idempotent
      UPDATE outbox_messages SET status = PROCESSED
  |
BullMQ Processor (@Processor) consumes job:
    Executes side effect (notify, update mastery, charge billing...)
    BullMQ retries with exponential backoff on failure
```

> **Planned change — fan-out routing:** the code today maps each event type to a single queue (`Map<string, string>`). The target design maps each event type to a list of queues (`Map<string, string[]>`) so one event can fan out to several consumers; the multi-queue lists in the Cross-Domain Event Map and in the domain docs assume this. `outbox_messages.status` has only `PENDING` and `PROCESSED`; there is no dead-letter queue or DLQ table.

### Planned BullMQ Queues

| Queue | Owner Module | Purpose |
|---|---|---|
| auth-events | auth | Auth-triggered user side effects |
| user-events | user | User profile sync side effects |
| org-events | org | Org and teacher application events |
| classroom-events | classroom | Lesson lifecycle side effects |
| assessment-events | assessment | Marking, mastery recalculation |
| progress-events | progress | Skill graph updates |
| notification-events | notifications | Push, email, in-app dispatch |
| billing-events | billing | Stripe/PayPal webhook processing |
| ai-events | ai | Report summarization, question generation |
| search-events | shared | Elasticsearch indexing |
| meet-events | classroom | Zoom/Meet link generation |

---

## Multi-Tenancy Strategy

Pattern: Shared MySQL/MariaDB database, application-layer tenant isolation via org_id.

Every tenanted resource carries an orgId field. Tenant isolation is enforced in the application layer: org-scoped repositories always filter by `orgId`, and NestJS guards verify that the caller holds an `OrganizationMembership` in the target organization (the org comes from the `:organizationId` path param on REST, or from the `orgId` join payload on WebSocket — the access token carries no `orgId`).

### Global vs Org-Scoped Resources

| Resource | Global | Org-Scoped |
|---|---|---|
| User | Yes | — |
| Account / Session / Verification / TwoFactor | Yes | — |
| ParentProfile / StudentProfile / TeacherProfile | Yes | — |
| Curriculum Graph | Yes | — |
| PlatformSubject / PlatformQuestions | Yes | — |
| Organization | Yes (entity) | — |
| OrganizationMembership | — | Yes |
| OrganizationSubject | — | Yes |
| Classroom / Lesson / LearningBoard | — | Yes |
| Org Questions / Teacher Questions | — | Yes |
| MasteryRecord | — | Yes (per student, node, org) |
| SubscriptionPlan | — | Yes |
| LessonReport | — | Yes |

---

## MVP Scope & Roadmap

### Phase 1 — MVP (Months 1-6)

- [x] IAM: Parent and teacher self-registration, OTP email verification, login, sessions
- [ ] IAM: TOTP 2FA (TwoFactor aggregate exists; enable/verify flows not built), refresh-token endpoint (none exists yet)
- [ ] IAM: Student registration by parent (student gets own User account), teacher invitation/marketplace application
- [ ] Org: Organization creation (by a teacher), marketplace listing, teacher hiring workflow
- [ ] Classroom: Creation, scheduling, availability templates, lesson state machine
- [ ] Learning Board: Teach/Classwork/Assignment modes, OT real-time sync
- [ ] Question Bank: Multi-tier ownership, MCQ/Short/Long Answer/Image Upload, auto+manual marking
- [ ] Curriculum Graph: UK, IB, Ontario CA seeded with full hierarchy
- [ ] Progress: Lesson reports (structured + AI draft), mastery skill graph
- [ ] Notifications: Push (FCM), email, in-app via WebSocket
- [ ] Billing: Stripe Connect + PayPal, org subscription plans, per-seat SaaS
- [ ] AI: Report summarization, question generation, next-lesson suggestion
- [ ] Platform Admin: Curriculum CMS, question bank management, org approval

### Phase 2 — Growth (Months 7-12)

- Org marketplace with ratings and reviews
- Group lessons (1-to-many classroom mode)
- Advanced AI gap analysis and student churn risk prediction
- Expanded curricula (US Common Core, Australian, etc.)
- Teacher performance analytics dashboard

### Phase 3 — Scale (Months 13-24)

- LTI/SCORM enterprise integrations
- Board and Assessment microservice extraction
- Official exam question content licensing marketplace
- Third-party API surface
