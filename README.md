# Eduvia Backend — Educational Operating System

[![NestJS](https://img.shields.io/badge/NestJS-v12.0-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v7.10-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MariaDB / MySQL](https://img.shields.io/badge/Database-MySQL%20%2F%20MariaDB-4479A1?logo=mysql&logoColor=white)](https://mariadb.org/)
[![Redis](https://img.shields.io/badge/Cache%20%26%20PubSub-Redis%20v7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/Queue-BullMQ%20v6-FF4500)](https://bullmq.io/)
[![Socket.io](https://img.shields.io/badge/WebSockets-Socket.io%20%2B%20Redis%20Adapter-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Elasticsearch](https://img.shields.io/badge/Search-Elasticsearch%208.x-005571?logo=elasticsearch&logoColor=white)](https://www.elastic.co/)
[![Tests](https://img.shields.io/badge/Tests-24%20suites%20%2F%20136%20passed%20(100%25)-brightgreen)](#testing--verification)
[![Linter](https://img.shields.io/badge/Linter-oxlint%20(0%20errors)-blue)](https://oxc.rs/)

> **Eduvia** is an educational operating system for tutoring organizations serving international K-12 students. Rather than a pure marketplace, Eduvia is an operational enterprise platform that unifies scheduling, live collaborative teaching, curriculum tracking, automated mastery analysis, and subscription billing with an optional marketplace discovery layer.

---

## Table of Contents

- [1. Executive Overview](#1-executive-overview)
- [2. System Architecture](#2-system-architecture)
  - [2.1 Architectural Pillars](#21-architectural-pillars)
  - [2.2 Architecture Diagram](#22-architecture-diagram)
  - [2.3 Clean Architecture & DDD Layers](#23-clean-architecture--ddd-layers)
- [3. Core Domain Modules](#3-core-domain-modules)
  - [Module 01: IAM & Authentication](#module-01-iam--authentication)
  - [Module 02: Organization & Marketplace](#module-02-organization--marketplace)
  - [Module 03: Classroom & Scheduling](#module-03-classroom--scheduling)
  - [Module 04: Learning Board & Collaborative Workspace](#module-04-learning-board--collaborative-workspace)
  - [Module 05: Question Bank & Assessment](#module-05-question-bank--assessment)
  - [Module 06: Curriculum Graph](#module-06-curriculum-graph)
  - [Module 07: Progress & Mastery Intelligence](#module-07-progress--mastery-intelligence)
  - [Module 08: Notifications & Messaging](#module-08-notifications--messaging)
  - [Module 09: Billing & Subscriptions](#module-09-billing--subscriptions)
  - [Module 10: AI Engine](#module-10-ai-engine)
  - [Module 11: Platform Administration](#module-11-platform-administration)
- [4. Realtime & Live Services](#4-realtime--live-services)
  - [4.1 Multi-Instance WebSockets (Socket.io + Redis)](#41-multi-instance-websockets-socketio--redis)
  - [4.2 Live Board Operational Transformation (ShareDB)](#42-live-board-operational-transformation-sharedb)
  - [4.3 Video Provider Integrations (Zoom + Google Meet)](#43-video-provider-integrations-zoom--google-meet)
  - [4.4 Firebase Storage Pre-Signed Uploads](#44-firebase-storage-pre-signed-uploads)
  - [4.5 Dedicated Search Engine (Elasticsearch 8.x)](#45-dedicated-search-engine-elasticsearch-8x)
- [5. Event-Driven Outbox & Asynchronous Messaging](#5-event-driven-outbox--asynchronous-messaging)
- [6. Project Layout](#6-project-layout)
- [7. Getting Started](#7-getting-started)
  - [7.1 Prerequisites](#71-prerequisites)
  - [7.2 Installation & Database Setup](#72-installation--database-setup)
  - [7.3 Environment Variables](#73-environment-variables)
  - [7.4 Running the Application](#74-running-the-application)
- [8. Testing & Verification](#8-testing--verification)
- [9. Deployment & Production Operations](#9-deployment--production-operations)

---

## 1. Executive Overview

Eduvia treats the **tutoring organization** as the primary unit of value. Tutors and students are affiliated with organizations that manage curriculum frameworks, staff availability, live classes, student performance tracking, and commercial billing.

### Primary Actors

| Role | Access Level | Responsibilities |
| :--- | :--- | :--- |
| **Parent** | External Customer | Self-registers, adds and manages student child accounts, discovers organizations, books classes, monitors lesson reports, manages billing. |
| **Student** | Learner | Attends live lessons, collaborates on real-time interactive learning boards, submits handwritten work, tracks mastery progress. |
| **Teacher** | Staff Member | Configures availability, conducts live classes, marks student responses, issues structured lesson reports with AI draft assistance. |
| **Teaching Assistant** | Support Staff | Observes live classrooms, assists students during classwork mode, assists with marking. |
| **Lead Teacher** | Department Head | Oversees subject curricula, curates organization question banks, conducts peer evaluations. |
| **Org Admin** | Organization Manager | Manages organization policies, invites teachers, configures terms, reviews billing and attendance. |
| **Org Owner** | Organization Proprietor | Full administrative, financial, and legal control over the organization tenant. |
| **Platform Super Admin** | Global Operator | Platform-wide oversight, audits organizations for marketplace approval, manages global feature flags and curricula. |

---

## 2. System Architecture

### 2.1 Architectural Pillars

1. **Modular Monolith**: Clean module boundaries with zero direct cross-module database foreign keys or shared repositories. Cross-module communication occurs strictly via explicit **Query Ports** or asynchronous **Domain Events**.
2. **Domain-Driven Design (DDD)**: Rich domain models enforcing invariants in Aggregates, Value Objects with UUIDv7 identifiers, and Domain Events.
3. **CQRS (Command Query Responsibility Segregation)**: Write operations run through `@nestjs/cqrs` Command Handlers; read operations execute through dedicated Query Handlers and optimized projections.
4. **Transactional Outbox Pattern**: State mutations and outbox records commit in the same database transaction, ensuring guaranteed **at-least-once** event delivery to Redis-backed BullMQ queues without dual-write inconsistencies.
5. **Horizontal Real-Time Scalability**: Socket.io gateways are attached to `@socket.io/redis-adapter` for multi-node clustering with graceful in-memory fallbacks for local development.

### 2.2 Architecture Diagram

```mermaid
flowchart TD
    Client["Client Devices\n(React Native App / Web Client)"]
    
    subgraph Edge ["Edge & API Layer"]
        Gateway["Reverse Proxy / Cloudflare"]
        REST["NestJS REST Controllers\n(Bearer JWT Auth & Org Scoping)"]
        WS["Socket.io Gateways\n(/notifications, /lesson, /board, /chat)"]
        ShareDB["ShareDB OT Server\n(/board-sync WebSocket)"]
    end

    subgraph Core ["Application Core (CQRS & DDD)"]
        Commands["Command Bus\n(State Mutations & Invariants)"]
        Queries["Query Bus & Ports\n(Projections & Read Models)"]
        Domain["Domain Aggregates\n(Entities, VOs, Domain Events)"]
    end

    subgraph Data ["Data Persistence Layer"]
        Prisma["Prisma ORM (v7.10)\nMariaDB / MySQL"]
        Outbox["Transactional Outbox Table\n(outbox_messages)"]
    end

    subgraph Async ["Event & Background Processing"]
        OutboxWorker["Outbox Poller Service\n(@Cron every 5s)"]
        RedisQueue["BullMQ on Redis\n(12 Domain Event Queues)"]
        Workers["Domain Event Workers\n(Classroom, Board, AI, Search, etc.)"]
    end

    subgraph External ["External & Managed Services"]
        ES["Elasticsearch 8.x\n(Full-text Search & Marketplace)"]
        Storage["Firebase Storage\n(Direct-to-Cloud Signed URLs)"]
        Video["Zoom / Google Meet APIs\n(Automated Meeting Links)"]
        LLM["AI Providers\n(OpenAI GPT-4o / Google Gemini)"]
    end

    Client --> Gateway
    Gateway --> REST
    Gateway --> WS
    Gateway --> ShareDB

    REST --> Commands
    REST --> Queries
    Commands --> Domain
    Domain --> Prisma
    Domain --> Outbox

    OutboxWorker --> Outbox
    OutboxWorker --> RedisQueue
    RedisQueue --> Workers

    Workers --> WS
    Workers --> ES
    Workers --> Video
    Workers --> LLM
    REST --> Storage
```

### 2.3 Clean Architecture & DDD Layers

Each domain module in `src/modules/<module-name>/` strictly implements a 4-layer architecture:

```
src/modules/<module-name>/
├── domain/                      # 1. Pure Domain Layer (No external frameworks)
│   ├── model/                   #    Aggregate Roots & Entities
│   ├── value-objects/           #    Immutable Value Objects & Typed UUIDv7 IDs
│   ├── events/                  #    Domain Events (extending BaseDomainEvent)
│   ├── errors/                  #    Domain Invariant Violations & Errors
│   ├── repository/              #    Abstract Repository Contracts (Interfaces)
│   └── ports/                   #    Outbound Domain Port Contracts
├── application/                 # 2. Application Layer (Use Cases & CQRS)
│   ├── commands/                #    Command Definitions & Command Handlers
│   ├── queries/                 #    Query Definitions & Query Handlers
│   └── dto/                     #    Application Data Transfer Objects
├── infrastructure/              # 3. Infrastructure Layer (Framework Adapters)
│   ├── persistence/             #    Prisma Repositories & Entity Mappers
│   ├── messaging/               #    BullMQ Queue Processors & Schedulers
│   └── services/                #    Third-party APIs & External Port Adapters
└── presentation/                # 4. Presentation Layer (HTTP & Guards)
    ├── controllers/             #    NestJS REST Controllers
    ├── services/                #    Presentation Façades
    └── dto/                     #    HTTP Request & Response DTOs
```

---

## 3. Core Domain Modules

Eduvia is composed of **11 cohesive domain modules**:

### Module 01: IAM & Authentication
- **Modules**: `src/modules/auth`, `src/modules/user`
- **Key Aggregates**: `AuthAccount`, `Session`, `VerificationToken`, `TwoFactorSecret`, `User`
- **Capabilities**:
  - Secure credential registration and login with bcrypt hashing.
  - Multi-device JWT sessions with refresh token rotation and revocation.
  - Time-based One-Time Passwords (TOTP 2FA) and email verification PINs.
  - Parent-child account linking: parents create child student profiles and set initial credentials; students activate on first login.
  - Global authentication guard (`AuthGuard`) extracting authenticated context into `@CurrentUser()`.

### Module 02: Organization & Marketplace
- **Module**: `src/modules/org`
- **Key Aggregates**: `Organization`, `OrganizationMembership`, `OrganizationPolicy`, `TeacherApplication`, `OrganizationInvitation`
- **Capabilities**:
  - Tenant creation and configuration (timezone, currency, booking rules, cancellation terms).
  - Role-based membership matrix: **Owner**, **Admin**, **Lead Teacher**, **Teacher**, **Teaching Assistant**.
  - Teacher recruitment pipeline: applications, vetting reviews, onboarding invitations.
  - Marketplace storefront listing: subject catalog, pricing policies, acceptance toggles for public discovery.

### Module 03: Classroom & Scheduling
- **Module**: `src/modules/classroom`
- **Key Aggregates**: `Classroom`, `Lesson`, `StudentEnrollment`, `TeacherAvailability`
- **Capabilities**:
  - Cohort and 1-on-1 classroom management with recurring scheduling patterns (recurrence rules, day of week, interval weeks).
  - Teacher availability management with blackout exception dates.
  - Complete lesson lifecycle: `PENDING` → `SCHEDULED` → `LIVE` → `COMPLETED` → `MARKING` → `REPORTED` → `ARCHIVED`.
  - Attendance and no-show accounting (Student No-Show vs. Teacher No-Show penalties).
  - Cover teacher delegation for scheduled classes.
  - Video meeting generation: triggers meeting creation upon entering `LIVE` status.

### Module 04: Learning Board & Collaborative Workspace
- **Module**: `src/modules/board`
- **Key Aggregates**: `LearningBoard`, `BoardSection`, `BoardQuestion`, `StudentResponse`
- **Capabilities**:
  - Real-time collaborative canvas integrated with **ShareDB Operational Transformation (OT)**.
  - Five distinct instructional modes:
    - **Teach Mode**: Teacher-authoritative presentation (students observe).
    - **Classwork Mode**: Interactive in-class exercises with independent student scratchpads.
    - **Assignment Mode**: Timed or take-home homework questions.
    - **Review Mode**: Collaborative post-lesson walkthrough and solution review.
    - **Locked Mode**: View-only canvas during teacher instruction or transitions.
  - Section management: text explanations, whiteboard figures, divider blocks, embedded questions.
  - Direct-to-cloud signed URL generation for handwritten photo submissions (`POST /boards/:boardId/upload-url`).

### Module 05: Question Bank & Assessment
- **Module**: `src/modules/assessment`
- **Key Aggregates**: `Question`, `Assessment`
- **Capabilities**:
  - Rich question repository supporting multiple item types: Multiple Choice (MCQ), Short Answer, Long Answer, Proof, Graph/Coordinate Plotting.
  - Tagging across international curriculum nodes, difficulty ratings (1–5), exam boards, and year groups.
  - Ownership partitioning: Platform-curated global questions vs. Organization-private items.
  - Formative and summative assessment generation with automated marking keys and rubric criteria.

### Module 06: Curriculum Graph
- **Module**: `src/modules/curriculum`
- **Key Aggregates**: `Curriculum`, `CurriculumNode`
- **Capabilities**:
  - Deep hierarchical graph modeling international educational standards (UK National Curriculum / GCSE / A-Levels, US Common Core / AP, IB Primary & Middle Years / Diploma).
  - Materialized path traversal for instant subtree querying (`/maths/algebra/quadratics`).
  - Leaf node validation for lesson tagging and targeted question assignment.
  - Fast prefix search for teacher autocomplete during lesson planning.

### Module 07: Progress & Mastery Intelligence
- **Module**: `src/modules/progress`
- **Key Aggregates**: `LessonReport`, `MasteryRecord`, `StudentProgressProfile`
- **Capabilities**:
  - Mandatory post-lesson structured reports filed by teachers (learning objectives covered, homework assignments, student behavior/engagement scores).
  - **Hybrid Mastery Engine**: Merges subjective teacher rubric ratings with objective quiz scores into an exponentially smoothed mastery score (0–100%) per curriculum node.
  - Student mastery heatmap generation for parent and teacher portals.
  - Continuous student churn risk detection based on attendance trends, declining mastery velocity, and overdue homework.

### Module 08: Notifications & Messaging
- **Module**: `src/modules/notifications`
- **Key Aggregates**: `Conversation`, `Message`, `Notification`
- **Capabilities**:
  - Real-time direct and channel messaging between teachers, parents, and students.
  - System event notification dispatch (lesson reminders, report submissions, billing receipts).
  - Unread badge counters synced across devices via WebSockets.
  - Push notification token registry with Firebase Cloud Messaging (FCM) abstraction.

### Module 09: Billing & Subscriptions
- **Module**: `src/modules/billing`
- **Key Aggregates**: `OrgBillingAccount`, `SubscriptionPlan`, `ParentSubscription`
- **Capabilities**:
  - Multi-tier organization SaaS subscription plans (seat thresholds, student volume limits).
  - Parent-to-organization lesson package subscriptions.
  - Automated grace period enforcement and dunning logic for payment retries.
  - Clean payment gateway abstraction (Stripe Connect / PayPal).

### Module 10: AI Engine
- **Module**: `src/modules/ai`
- **Key Aggregates**: `AIPromptTemplate`, `AIJob`
- **Capabilities**:
  - Asynchronous AI job processing queue (`ai-events`) using BullMQ.
  - Multi-provider LLM abstraction layer supporting OpenAI (`gpt-4o`) and Google Gemini (`gemini-2.0-flash`).
  - Automated parent lesson report drafting: synthesizes teacher notes, questions solved, and student performance into clear progress summaries.
  - AI question generation aligned with curriculum standards and target difficulty levels.

### Module 11: Platform Administration
- **Module**: `src/modules/platform-admin`
- **Key Aggregates**: `PlatformAdmin`, `OrgApprovalRecord`, `PlatformFeatureGuard`, `PlatformAnnouncement`
- **Capabilities**:
  - Organization verification pipeline: KYC review, document checks, and marketplace admission approvals/rejections.
  - Global feature flags and emergency kill-switches for platform capabilities.
  - System-wide broadcast announcement engine delivering operational notices to organizations.
  - Real-time platform health and telemetry monitoring.

---

## 4. Realtime & Live Services

Eduvia includes a production-grade suite of real-time and live services:

### 4.1 Multi-Instance WebSockets (Socket.io + Redis)
- **Adapter**: `SocketIoAdapter` with `@socket.io/redis-adapter` for multi-node horizontal scaling.
- **Authentication**: `WsJwtGuard` parses JWT tokens from handshake auth or authorization headers, auto-joining authenticated sockets to personal rooms (`user:${userId}`) and organization rooms (`org:${orgId}`).
- **Namespaces**:
  - `/notifications`: Real-time alerts and live unread counter updates.
  - `/lesson`: Lesson lifecycle state changes and live video meeting links.
  - `/board`: Room presence, cursor movement tracking, mode transitions, and section updates.
  - `/chat`: Direct and group messaging channels with typing indicators.

### 4.2 Live Board Operational Transformation (ShareDB)
- **Path**: `/board-sync` (Dedicated WebSocket server).
- **Service**: `ShareDBBackendService` & `BoardDocumentService`.
- **Protocol**: Server-authoritative JSON0 operational transformation for concurrent multi-user editing.
- **Access Control**: Enforces instructional mode constraints (e.g., student write operations are rejected during `teach` mode; edits are disallowed when board is `locked`).

### 4.3 Video Provider Integrations (Zoom + Google Meet)
- **Port**: `IVideoProviderPort` (`src/modules/classroom/domain/ports/video-provider.port.ts`).
- **Adapters**:
  - `ZoomAdapter`: Server-to-Server OAuth flow against Zoom REST API (`https://api.zoom.us/v2/users/me/meetings`) with automatic token renewal and meeting password generation.
  - `GoogleMeetAdapter`: Google Calendar API integration (`v3`) with signed JWT Service Account authentication for automated Google Meet link provisioning.
  - `VideoProviderFactory`: Dynamic provider selection with deterministic fallback generation for local development and test environments.
- **Event Hook**: When a lesson transitions to `LIVE`, meeting links are automatically generated, attached to the lesson record, and broadcast to enrolled participants over WebSockets.

### 4.4 Firebase Storage Pre-Signed Uploads
- **Service**: `FirebaseStorageService` (`src/modules/shared/infrastructure/storage/`).
- **Direct-to-Cloud Uploads**: Generates Google Cloud Storage / Firebase Storage V4 pre-signed PUT/POST policies so client mobile applications upload photos directly to cloud storage, eliminating backend bandwidth bottlenecks.
- **Storage Buckets**: Partitioned paths for `student-responses`, `org-logos`, `board-images`, `question-images`, and `avatars`.
- **Server Buffers**: `uploadBuffer` handles server-side generated assets (PDF lesson reports, export documents).

### 4.5 Dedicated Search Engine (Elasticsearch 8.x)
- **Service**: `ElasticsearchService` (`src/modules/shared/infrastructure/elasticsearch/`).
- **Domain Services**: `OrgSearchService`, `QuestionSearchService`, `CurriculumNodeSearchService`.
- **Search Worker**: BullMQ processor consuming `search-events` for asynchronous write-side derived indexing.
- **In-Memory Fallback**: Includes a built-in search evaluator that replicates Elasticsearch boolean query logic (must, filter, should, multi-match, prefix) for zero-dependency local development and CI testing.

---

## 5. Event-Driven Outbox & Asynchronous Messaging

Eduvia implements the **Transactional Outbox Pattern** to ensure state persistence and message dispatch remain atomic.

```mermaid
sequenceDiagram
    participant CommandHandler as Command Handler
    participant DB as MariaDB / MySQL Transaction
    participant Poller as Outbox Poller (@Cron 5s)
    participant Redis as Redis / BullMQ
    participant Worker as Event Worker

    CommandHandler->>DB: 1. Update Domain Aggregate Table
    CommandHandler->>DB: 2. Insert outbox_messages (PENDING)
    DB-->>CommandHandler: 3. Commit Transaction
    Note over DB,Poller: State & Outbox Guaranteed Atomic
    Poller->>DB: 4. SELECT * FROM outbox_messages WHERE status = 'PENDING'
    Poller->>Redis: 5. Dispatch Event to Target Queue
    Poller->>DB: 6. UPDATE outbox_messages SET status = 'PUBLISHED'
    Redis->>Worker: 7. Process Job Asynchronously
```

### Registered BullMQ Queues

| Queue Name | Purpose & Consumed Events |
| :--- | :--- |
| `auth-events` | Account registration, password changes, session revocations. |
| `user-events` | Profile updates, student additions by parents. |
| `org-events` | Org approvals, teacher applications, invitations, subject updates. |
| `classroom-events` | Lesson scheduling, start/complete lifecycles, no-show events, board auto-creation. |
| `board-events` | Board mode changes, lock/unlock states, section updates, response submissions. |
| `assessment-events` | Question creation, assessment publishing. |
| `progress-events` | Lesson reports submitted, continuous mastery re-calculations. |
| `notification-events` | Chat messages, lesson reminders, report dispatch, push alerts. |
| `billing-events` | Subscription creation, tier changes, payment failure dunning. |
| `ai-events` | AI lesson report synthesis, question drafting jobs. |
| `platform-admin-events`| Org verification audits, platform broadcast announcements. |
| `search-events` | Elasticsearch indexing for organizations, questions, and curriculum nodes. |

---

## 6. Project Layout

```
eduvia-backend/
├── docs/                        # Architectural blueprints, setup guides & DDD specs
├── infrastructure/              # Deployment manifests (Docker, Nginx, Compose)
├── prisma/
│   └── schema/                  # Multi-file Prisma schema partitioned by domain
├── scripts/                     # Operational utility scripts
├── src/
│   ├── app.controller.ts        # Health check & root API endpoints
│   ├── app.module.ts            # Root application module wiring all 11 domains
│   ├── main.ts                  # NestJS entrypoint (Socket.io & ShareDB WS binding)
│   ├── generated/               # Prisma generated database client
│   └── modules/
│       ├── auth/                # IAM & Authentication domain
│       ├── user/                # User & Student Identity domain
│       ├── org/                 # Organization & Marketplace domain
│       ├── classroom/           # Classroom & Scheduling domain
│       ├── board/               # Learning Board & ShareDB OT domain
│       ├── assessment/          # Question Bank & Assessment domain
│       ├── curriculum/          # Curriculum Graph domain
│       ├── progress/            # Progress, Mastery & Reporting domain
│       ├── notifications/       # Notifications & Real-Time Messaging domain
│       ├── billing/             # Billing & Subscriptions domain
│       ├── ai/                  # Multi-Provider AI Engine domain
│       ├── platform-admin/      # Platform Administration domain
│       ├── websocket/           # Global WebSocket Module (Socket.io Gateways)
│       └── shared/              # Shared kernel (Prisma, Redis, Outbox, Storage, Search)
├── test/
│   └── __mocks__/               # CommonJS test mocks for Jest environment
├── .env.example                 # Base environment configuration template
├── .env.production.example      # Production environment configuration template
├── Makefile                     # Build, container, and database orchestration targets
└── package.json                 # Dependency definitions and scripts
```

---

## 7. Getting Started

### 7.1 Prerequisites

- **Node.js**: `v22.x` or later (LTS recommended)
- **pnpm**: `v10.x` or later
- **MariaDB** or **MySQL**: `v10.11+` / `v8.0+`
- **Redis**: `v7.x` or later
- *(Optional)* **Elasticsearch**: `v8.x` (In-memory fallback operates automatically if omitted)

### 7.2 Installation & Database Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/OlamidotunIY/eduvia-backend.git
   cd eduvia-backend
   ```

2. **Install project dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Generate Prisma client and run migrations:**
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

### 7.3 Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | HTTP & WebSocket server port | `3000` |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` |
| `DATABASE_URL` | MySQL / MariaDB connection URI | `mysql://user:pass@localhost:3306/eduvia` |
| `REDIS_URL` | Redis connection URI (BullMQ queues & Socket.io) | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for signing authentication tokens | `your-secure-jwt-secret` |
| `BCRYPT_SALT_ROUNDS` | Salt rounds for password hashing | `10` |
| `ELASTICSEARCH_URL` | *(Optional)* Elasticsearch cluster endpoint | `http://localhost:9200` |
| `ELASTICSEARCH_API_KEY` | *(Optional)* Elasticsearch API authentication key | `base64-api-key` |
| `FIREBASE_STORAGE_BUCKET`| *(Optional)* Cloud storage bucket name | `eduvia-uploads.appspot.com` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | *(Optional)* Service account JSON credentials path | `/secrets/firebase-sa.json` |
| `ZOOM_CLIENT_ID` | *(Optional)* Zoom Server-to-Server OAuth Client ID | `your-zoom-client-id` |
| `ZOOM_CLIENT_SECRET` | *(Optional)* Zoom Server-to-Server OAuth Secret | `your-zoom-secret` |
| `ZOOM_ACCOUNT_ID` | *(Optional)* Zoom Account ID | `your-zoom-account-id` |
| `OPENAI_API_KEY` | *(Optional)* OpenAI API Key for AI report generation | `sk-...` |
| `GEMINI_API_KEY` | *(Optional)* Google Gemini API Key | `AIza...` |
| `OBSERVABLE_API_KEY` | *(Optional)* NestJS Observe telemetry key | `obs-key` |

> **Graceful Degradation:** All third-party external integrations (Elasticsearch, Firebase Storage, Zoom, Google Meet, OpenAI, Gemini) feature automatic mock fallbacks. The application compiles, starts, and executes full test suites locally without requiring active external API keys.

### 7.4 Running the Application

```bash
# Start in watch mode for development
pnpm run start:dev

# Start in debug mode
pnpm run start:debug

# Build production bundle (via SWC)
pnpm run build

# Start production server
pnpm run start:prod
```

---

## 8. Testing & Verification

The codebase maintains a 100% test pass rate across all domains and real-time adapters.

```bash
# Run all unit tests
pnpm test

# Run tests with force exit (clean teardown)
pnpm test -- --forceExit

# Run tests for a specific domain module
pnpm test src/modules/classroom/test/
pnpm test src/modules/board/test/
pnpm test src/modules/websocket/test/

# Run code linter (oxlint)
pnpm run lint
```

### Architecture Rule Verification

To verify that all modules strictly comply with DDD and Clean Architecture isolation rules:

```powershell
# Audit a specific module
powershell -NoProfile -ExecutionPolicy Bypass -File ./.agents/skills/audit-module/scripts/Audit-Module.ps1 -Module classroom
powershell -NoProfile -ExecutionPolicy Bypass -File ./.agents/skills/audit-module/scripts/Audit-Module.ps1 -Module board
```

---

## 9. Deployment & Production Operations

### Containerization

The repository includes a multi-stage production Dockerfile located in the root directory:

```bash
# Build production Docker image
docker build -t eduvia-backend:latest .

# Run container
docker run -p 3000:3000 --env-file .env eduvia-backend:latest
```

### Makefile Automation

Common administrative workflows are orchestrated via the `Makefile`:

```bash
# Display help and available commands
make help

# Build and start Docker services
make up

# Tail production application logs
make logs

# Stop containers
make down
```

---

## License

This software is proprietary and confidential. All rights reserved. Unauthorized copying, distribution, or modification is strictly prohibited.
