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
| **Parent** | Self-registers (only self-registering human) | Adds children, discovers orgs, manages billing |
| **Student** | Registered by parent | Attends lessons, submits classwork/assignments, sees mastery map |
| **Teacher** | Invited by org admin OR applies via marketplace | Prepares lessons, teaches live, marks work, submits reports |
| **Teaching Assistant** | Invited by org admin | Limited access, assists in lessons |
| **Lead Teacher** | Promoted by Org Admin | Reviews/approves reports, manages org curriculum resources, mentors teachers |
| **Org Admin** | Creates org OR promoted by Org Owner | Manages org operations, teachers, scheduling, policies |
| **Org Owner** | Creates org (auto-assigned) | Full org control |
| **Platform Super Admin** | Platform-level account | Manages curricula, question bank, org approvals, platform health |

### Core Differentiators

| Differentiator | Description |
|---|---|
| Curriculum Graph | Deep hierarchical graph of international curricula — resolved per student country |
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
│  │            PostgreSQL (Primary Database)          │    │
│  │        Domain tables + outbox_messages            │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         │ Outbox Poller (setInterval)      │
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
| Database | PostgreSQL | via pg v8 + @prisma/adapter-pg |
| Cache/Pub-Sub | Redis | via ioredis v6 |
| Job Queue | BullMQ v6 | @nestjs/bullmq wrapper |
| Auth - Hashing | bcrypt v6 | Password hashing |
| Auth - JWT | jsonwebtoken v9 | Access + refresh tokens |
| Auth - TOTP | speakeasy v2 | Time-based OTP (2FA) |
| Observability | @nestjs/observe v0.1.8 | Distributed tracing, metrics, error telemetry |
| Linting | oxlint v1.58 | Fast Rust-based linter |
| Language | TypeScript v6 | Strict mode, ESM ("type": "module") |
| Testing | Jest v30 + Supertest | Unit + E2E |
| Real-time | Socket.io | To add — with Redis adapter |
| Search | Elasticsearch | To add |
| Payments | Stripe Connect + PayPal | To add |
| AI | OpenAI / Gemini (abstracted port) | To add |
| Mobile | React Native | Separate repo |
| Push | Firebase Cloud Messaging (FCM) | To add |
| Email | SendGrid / Resend | To add |
| File Storage | AWS S3 / Cloudflare R2 | To add (student image uploads) |
| Video | Zoom / Google Meet API | Link generation only — no owned video infra |

> **Prisma 7:** Uses multi-file schema (prisma/schema/*.prisma). Generator outputs to src/generated/prisma. Uses @prisma/adapter-pg driver adapter.

---

## Existing Codebase State

### What Is Already Built

| Module | Status | Detail |
|---|---|---|
| `auth` | Built | AuthAccount, Session, Verification aggregates; full CQRS: create, login, logout, OTP, TOTP, revoke sessions, update credentials, suspend |
| `user` | Built | User aggregate: create, updateProfile, suspend, activate; UserCreatedEvent, UserUpdatedEvent |
| `shared` | Built | AggregateRoot, DomainEvent base, OutboxMessage model, OutboxPublisherService (poller), BullMQ module, Redis service, Prisma service, HTTP middleware |

### What Needs to Be Built

| Module | Priority |
|---|---|
| Organization & Marketplace | P0 — MVP |
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
    events/          BullMQ processor/worker classes
  infrastructure/
    repository/      Prisma implementations of IXxxRepository
    services/        Port adapter implementations
    mappers/         Prisma record <-> Domain model mappers
  presentation/
    controllers/     HTTP controllers (thin — validate DTO, dispatch command)
    dto/             Request/Response DTOs
    services/        Orchestration services (multi-command flows)
  {domain}.module.ts NestJS module — wires all providers
  index.ts           Public barrel export (facade pattern)
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
  ├── AuthAccount (1:1) — credentials, TOTP, auth status
  │     ├── Session[] — per-device refresh token sessions
  │     └── Verification[] — OTP / email verification records
  ├── ParentProfile (when userType = parent)
  │     └── StudentProfile[] — children added by this parent
  └── OrgMembership[] (when userType = teacher | admin)
        └── role: OrgOwner | OrgAdmin | LeadTeacher | Teacher | TeachingAssistant
```

### Curriculum Resolution Rule

A student has ONE curriculum, resolved from their country of residence:
```
StudentProfile.countryCode -> CurriculumProfile (e.g., UK, Ontario CA, IB)
```
All subjects the student takes fall under this single curriculum. There is no per-subject curriculum override.

### Classroom Model

```
Organization (org_id isolation boundary)
  └── Classroom (permanent educational channel for a subject)
        ├── primaryTeacher: OrgMembership
        ├── coverTeacher?: OrgMembership (for lesson-level overrides)
        ├── enrolledStudents: StudentEnrollment[]
        ├── subject: OrgSubject -> PlatformSubject -> CurriculumNode
        ├── recurrence: { dayOfWeek, startTime, timezone, intervalWeeks }
        └── lessons: Lesson[]
              └── LearningBoard (1:1, auto-created with lesson)
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
| SCHEDULED | Parent accepts booking / admin confirms | Parent / OrgAdmin |
| LIVE | Teacher starts session on the Learning Board | Teacher |
| COMPLETED | Lesson end time reached OR teacher ends session | System / Teacher |
| MARKING | Teacher enters marking mode on the board | Teacher |
| REPORTED | Teacher approves AI report draft and submits | Teacher |
| ARCHIVED | Report locked 7 days after submission | System |

### Cross-Domain Event Map (Planned)

| Event | Producer | Consumer Queues |
|---|---|---|
| AuthAccountCreatedEvent | auth | user-events |
| AccountSuspendedEvent | auth | user-events |
| UserCreatedEvent | user | auth-events |
| UserUpdatedEvent | user | auth-events |
| OrgCreatedEvent | org | search-events |
| TeacherApplicationReceivedEvent | org | notification-events |
| LessonScheduledEvent | classroom | notification-events, billing-events |
| LessonStartedEvent | classroom | meet-events |
| LessonCompletedEvent | classroom | assessment-events, notification-events |
| LessonReportedEvent | classroom | notification-events, progress-events |
| AssessmentSubmittedEvent | board | assessment-events |
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
2. Server guard validates JWT -> extracts { userId, orgId, role, deviceId }
3. Server auto-joins client to room: user:{userId}
4. Client emits join_lesson or join_board with target ID
5. Server validates membership -> joins appropriate room
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
OutboxPublisherService polls every 5s (setInterval):
    SELECT * FROM outbox_messages WHERE status = PENDING LIMIT 50
    For each message:
      OUTBOX_EVENT_ROUTES.get(message.type) -> queue name
      queue.add(message.type, payload, { jobId: message.id })  // idempotent
      UPDATE outbox_messages SET status = PROCESSED
  |
BullMQ Worker (@Processor) consumes job:
    Executes side effect (notify, update mastery, charge billing...)
    BullMQ retries with exponential backoff on failure
    Dead-letter handling for max-retry exhaustion
```

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

Pattern: Shared PostgreSQL database, application-layer tenant isolation via org_id.

Every tenanted resource carries an orgId field. Prisma middleware and NestJS guards enforce that all tenanted queries include WHERE org_id = current_org_id.

### Global vs Org-Scoped Resources

| Resource | Global | Org-Scoped |
|---|---|---|
| User | Yes | — |
| AuthAccount / Session / Verification | Yes | — |
| ParentProfile / StudentProfile | Yes | — |
| Curriculum Graph | Yes | — |
| PlatformSubject / PlatformQuestions | Yes | — |
| Organization | Yes (entity) | — |
| OrgMembership | — | Yes |
| OrgSubject | — | Yes |
| Classroom / Lesson / LearningBoard | — | Yes |
| Org Questions / Teacher Questions | — | Yes |
| SubscriptionPlan | — | Yes |
| LessonReport | — | Yes |

---

## MVP Scope & Roadmap

### Phase 1 — MVP (Months 1-6)

- [x] IAM: Parent self-registration, OTP email verification, login, sessions, TOTP 2FA
- [ ] IAM: Student registration by parent, teacher invitation/marketplace application
- [ ] Org: Organization creation, marketplace listing, teacher hiring workflow
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
