# 02 — Organization & Marketplace

> **Module:** `src/modules/org`
> **Status:** Partially built — domain entities (Organization, OrganizationPolicy, OrganizationMembership, OrganizationSubject, OrganizationInvitation, TeacherApplication) exist; commands built: create organization, receive teacher application, invitation-accepted handling, update organization subject. Approval/rejection, invitations API, memberships API and marketplace search are still to build.
> **NestJS Module:** `OrgModule`
>
> **Naming:** all org concepts use the `Organization*` prefix (`OrganizationMembership`, `OrganizationSubject`, `OrganizationInvitation`, `OrganizationCreatedEvent`, …). The module folder (`org`), queue (`org-events`), and the enum names `OrgStatus` / `OrganizationRole` (values `OrgOwner`, `OrgAdmin`, …) keep their short form. Field names such as `orgId` are unchanged.

---

## Overview

The Organization & Marketplace module manages everything about tutoring organizations on Eduvia — their creation, configuration, public marketplace presence, teacher hiring (invitation + marketplace application), and student enrollment management.

Organizations are the primary operational unit of Eduvia. Every classroom, lesson, question bank entry, and billing plan exists within an organization context.

**Only a teacher can create an organization**, and becomes its `OrgOwner`. An `OrgAdmin` is promoted by the Org Owner.

---

## Domain Models

### 1. Organization (Aggregate Root)

The central tenant entity. Owns all other org-scoped resources.

```
Organization
  id:                   UUID
  ownerId:              UUID (FK -> User — the OrgOwner; a teacher)
  name:                 string
  slug:                 string (unique, URL-safe, e.g. "bright-minds-academy")
  description:          string?
  logoUrl:              string?
  websiteUrl:           string?
  contactEmail:         string
  contactPhone:         string?
  country:              string (ISO 3166-1, org's operating country)
  timezone:             string (IANA)
  status:               pending_approval | active | suspended | rejected   (enum OrgStatus)
  marketplaceListed:    boolean (whether they appear in public marketplace)
  acceptingTeachers:    boolean (whether the org is open for teacher applications)
  acceptingTeachersFor: Json (subjects the org is hiring for)
  createdAt:            DateTime
  updatedAt:            DateTime

  subjects:             OrganizationSubject[]
  memberships:          OrganizationMembership[]
  policy:               OrganizationPolicy (embedded value object, stored inline on the organizations table)
  subscriptionPlans:    SubscriptionPlan[]
```

**Domain Methods:**
- `Organization.create(params)` — emits `OrganizationCreatedEvent`; validates slug uniqueness (at repo level)
- `org.updateProfile(params)` — emits `OrganizationUpdatedEvent`
- `org.listOnMarketPlace()` — sets `marketplaceListed = true`; throws if status != active; emits `OrganizationListedOnMarketplaceEvent`
- `org.delistFromMarket()` — sets `marketplaceListed = false`
- `org.openForTeacherApplication(subjects)` — sets `acceptingTeachers = true` with allowed subjects
- `org.closeTeacherApplications()` — sets `acceptingTeachers = false`
- `org.suspend()` — emits `OrganizationSuspendedEvent`
- `org.approve()` — sets status to active; emits `OrganizationApprovedEvent`
- `org.reject(reason)` — sets status to rejected; emits `OrganizationRejectedEvent` *(planned — not in code yet)*

`Organization.approve()` and `Organization.reject()` are the **only** emitters of `OrganizationApprovedEvent` / `OrganizationRejectedEvent`. The platform admin's approve/reject command (see [11-platform-admin.md](11-platform-admin.md)) calls them and also writes an audit-only `OrgApprovalRecord`; no other event changes org status.

---

### 2. OrganizationSubject (Aggregate Root)

An org's definition of a subject they offer, linked to a platform-standard subject.

```
OrganizationSubject
  id:                UUID
  orgId:             UUID
  name:              string (org's own name, e.g. "11+ Maths")
  platformSubjectId: UUID? (FK -> PlatformSubject — optional link to standard)
  description:       string?
  isActive:          boolean
  createdAt:         DateTime
```

**Domain Methods:** `rename`, `updateDescription`, `linkToPlatformSubject`, `activate`, `deactivate`.

**Domain Logic:**
- An OrganizationSubject can optionally be mapped to a PlatformSubject
- A PlatformSubject is linked to nodes in the Curriculum Graph
- Curriculum resolution flows: Student `countryCode` + `gradeLevel` -> CurriculumProfile -> CurriculumNode (via PlatformSubject mapping — see [06-curriculum-graph.md](06-curriculum-graph.md))

---

### 3. OrganizationPolicy (Embedded Value Object)

Org-level configurable operational rules. Enforced by the system. Stored as inline columns on the `organizations` table (there is no separate policy table).

```
OrganizationPolicy
  minimumBookingNoticeHours: int (e.g. 24 — lesson must be booked >= 24h ahead)
  cancellationWindowHours:   int (e.g. 48 — free cancellation within X hours before lesson)
  noShowWaitMinutes:         int (e.g. 15 — wait X min, then a no-show may be marked)
  autoRescheduleOnNoShow:    boolean
  lessonPlanRequired:        boolean (teachers must complete plan before LIVE state)
  reportRequiredWithinHours: int (e.g. 24 — report must be submitted within X hours of completion)
```

---

### 4. TeacherApplication (Aggregate Root)

Represents a teacher's application to join an org via the marketplace.

```
TeacherApplication
  id:               UUID
  orgId:            UUID
  applicantUserId:  UUID (the applying teacher's User ID)
  appliedSubjects:  Json (subjects teacher is applying to teach)
  status:           pending_review | auto_rejected | approved | rejected
  rejectionReason:  string?
  reviewedBy:       UUID? (OrgAdmin userId who reviewed)
  reviewedAt:       DateTime?
  createdAt:        DateTime
  updatedAt:        DateTime

  coverLetter:      string?
  qualifications:   string?
```

**Domain Methods:**
- `TeacherApplication.create(params)` — emits `TeacherApplicationReceivedEvent`
- `application.autoReject(reason)` — sets status to `auto_rejected`; emits `TeacherApplicationAutoRejectedEvent` *(planned)*
- `application.approve(reviewerId)` — sets status to `approved`; emits `TeacherApplicationApprovedEvent`
- `application.reject(reviewerId, reason)` — sets status to `rejected`; emits `TeacherApplicationRejectedEvent`

**Auto-Rejection Logic (Domain Service):**
```
AppliedSubjects ∩ Org.acceptedSubjects == ∅ → auto-reject immediately
AppliedSubjects ∩ Org.acceptedSubjects != ∅ → route to admin review queue
```

---

### 5. OrganizationInvitation (Aggregate Root)

An invitation sent by an org admin to a specific person (teacher or parent).

```
OrganizationInvitation
  id:             UUID
  orgId:          UUID
  inviterUserId:  UUID (who sent the invitation)
  inviteeEmail:   string
  role:           Teacher | TeachingAssistant | parent (parent invited to enroll student)
  subjects:       Json (for teacher invitations — which subjects)
  tokenHash:      string (hashed invitation token)
  status:         pending | accepted | expired | revoked
  expiresAt:      DateTime
  acceptedAt:     DateTime?
  createdAt:      DateTime
```

**Domain Methods:**
- `OrganizationInvitation.create(params)` — emits `OrganizationInvitationSentEvent`
- `invitation.accept(acceptedByUserId, correlationId)` — marks accepted; emits `OrganizationInvitationAcceptedEvent` → the org module's processor creates the `OrganizationMembership`
- `invitation.revoke()` — marks revoked
- `invitation.expire()` — marks expired (called by cron)
- `invitation.isValid()` — returns false if expired, revoked, or accepted

### 6. OrganizationMembership (Aggregate Root)

Represents a user's role within a specific organization. Owned by the **org module**: it is the only module that creates or changes memberships.

```
OrganizationMembership
  id:         UUID
  orgId:      UUID (FK -> Organization)
  userId:     UUID (FK -> User)
  role:       OrgOwner | OrgAdmin | LeadTeacher | Teacher | TeachingAssistant   (enum OrganizationRole)
  subjects:   Json (subjects this teacher is qualified for, empty for admin roles)
  status:     active | inactive | suspended
  joinedAt:   DateTime
  updatedAt:  DateTime
```

**Domain Methods:** `OrganizationMembership.create`, `changeRole(newRole)`, `updateSubjects(subjects)`, `suspend()`, `isActive()`, `isAdmin()`.

**Membership creation (event-driven, owned by the org module):** both `OrganizationInvitationAcceptedEvent` and `TeacherApplicationApprovedEvent` are routed to `org-events` and consumed by the org module's own `OrganizationEventProcessor` (`infrastructure/messaging/listeners/`), which dispatches the org module's command that creates the `OrganizationMembership`. No other module creates memberships.

**Role Hierarchy (descending permissions):**
```
OrgOwner > OrgAdmin > LeadTeacher > Teacher > TeachingAssistant
```

**Per-role capabilities:**

| Capability | OrgOwner | OrgAdmin | LeadTeacher | Teacher | TA |
|---|---|---|---|---|---|
| Delete org | Yes | - | - | - | - |
| Manage admins (promote/demote OrgAdmin) | Yes | - | - | - | - |
| Manage teachers | Yes | Yes | - | - | - |
| Manage curriculum resources | Yes | Yes | Yes | - | - |
| Run solo lessons | Yes | - | Yes | Yes | - |
| Assist in lessons | Yes | - | Yes | Yes | Yes |
| View all org reports | Yes | Yes | Yes | - | - |

Lesson reports are submitted by the teacher; there is no Lead Teacher approval step.

---

## Domain Events

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `OrganizationCreatedEvent` | Organization.create | orgId, ownerId, name, slug | org-events, search-events |
| `OrganizationUpdatedEvent` | org.updateProfile | orgId, changedFields | search-events |
| `OrganizationApprovedEvent` | org.approve | orgId | notification-events (notify org owner) |
| `OrganizationRejectedEvent` | org.reject | orgId, reason | notification-events (notify org owner) |
| `OrganizationSuspendedEvent` | org.suspend | orgId | notification-events |
| `OrganizationListedOnMarketplaceEvent` | org.listOnMarketPlace | orgId | search-events (index org publicly) |
| `TeacherApplicationReceivedEvent` | TeacherApplication.create | applicationId, orgId, applicantUserId, subjects | org-events (auto-screen), notification-events |
| `TeacherApplicationAutoRejectedEvent` | application.autoReject | applicationId, orgId, reason | notification-events (email applicant) |
| `TeacherApplicationApprovedEvent` | application.approve | applicationId, orgId, applicantUserId, approvedSubjects | org-events (create OrganizationMembership), notification-events |
| `TeacherApplicationRejectedEvent` | application.reject | applicationId, orgId, reason | notification-events |
| `OrganizationInvitationSentEvent` | OrganizationInvitation.create | invitationId, orgId, inviteeEmail, role | notification-events (send invite email) |
| `OrganizationInvitationAcceptedEvent` | invitation.accept | invitationId, orgId, acceptedByUserId, role | org-events (create OrganizationMembership) |

Multi-queue routes assume the planned fan-out `OUTBOX_EVENT_ROUTES` (see [00-ddd-architecture.md](00-ddd-architecture.md)).

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| Only active orgs can appear in marketplace | `org.listOnMarketPlace()` — throws if status != active |
| Teacher applications auto-rejected if no subject overlap | `TeacherApplicationScreeningService` — compares applied vs accepted subjects |
| An OrganizationInvitation expires after a configured window (e.g. 7 days) | `invitation.isValid()` checks wall-clock vs `expiresAt` |
| A teacher cannot apply to an org they are already a member of | Checked at application creation (repo-level lookup) |
| An org must have at least one active admin at all times | Enforced when demoting/removing the last admin |
| OrganizationSubjects can be linked to platform subjects — but not required | OrganizationSubject.platformSubjectId is nullable |
| Parent enrollment is invitation-only OR self-discovery — both flows create the same StudentEnrollment | Enrollment domain service |

---

## Business Actions

### Org Management

| Action | Description |
|---|---|
| Create organization | A teacher registers the org and becomes OrgOwner; status = `pending_approval`; platform super admin approves or rejects |
| Update org profile | OrgAdmin updates name, description, logo, contact info |
| List org on marketplace | OrgAdmin enables public listing; org must be active |
| Open org to teacher applications | OrgAdmin specifies which subjects they are hiring for |
| Configure org policy | OrgAdmin sets cancellation window, no-show wait, lesson plan requirements |
| Add org subject | OrgAdmin creates OrganizationSubject; optionally maps to PlatformSubject |
| Promote member to OrgAdmin | Org Owner changes `OrganizationMembership.role` |

### Teacher Hiring

| Action | Description |
|---|---|
| Invite teacher directly | OrgAdmin creates OrganizationInvitation (email + subjects); system sends invite link |
| Teacher accepts invitation | Teacher (via deep link) accepts → `OrganizationInvitationAcceptedEvent` → OrganizationMembership created by the org module |
| Teacher applies via marketplace | Applicant submits TeacherApplication for an open org |
| Auto-screen application | System checks subject overlap → auto-reject or route to admin |
| Admin reviews application | OrgAdmin approves or rejects with reason |
| Approved application → create membership | `TeacherApplicationApprovedEvent` → org module creates OrganizationMembership with Teacher role and approved subjects |
| Promote teacher to LeadTeacher | OrgAdmin changes OrganizationMembership.role |
| Suspend teacher from org | OrgAdmin sets OrganizationMembership.status = suspended |
| Remove teacher from org | OrgAdmin deletes OrganizationMembership (soft-delete with audit) |

### Student Enrollment

| Action | Description |
|---|---|
| Org invites parent | OrgAdmin creates OrganizationInvitation with role=parent; system sends email |
| Parent discovers org | Parent searches marketplace → views org profile → initiates enrollment |
| Parent enrolls student | Parent links their StudentProfile to an org for a specific OrganizationSubject |
| Enrollment creates billing context | On enrollment, a SubscriptionPlan selection is triggered |
| Org removes student | OrgAdmin removes StudentEnrollment (deactivates, preserves history) |

---

## Marketplace Features

### Org Marketplace Page (Public)

```
Public Org Profile:
  - Name, slug, description, logo
  - Subjects offered (OrganizationSubject list)
  - Country / timezone
  - Pricing range (from their SubscriptionPlan min/max)
  - Is accepting teacher applications (with subject filters)
  - Rating + review count (Phase 2)
  - Number of active students (anonymized)
  - Featured teachers (opt-in, Phase 2)
```

### Search & Discovery (Elasticsearch)

Org documents are indexed in Elasticsearch when:
- `OrganizationCreatedEvent` fires + `OrganizationListedOnMarketplaceEvent` fires
- `OrganizationUpdatedEvent` fires → re-index

Index fields: name, description, subjects, country, slug, status (only active+listed searchable publicly)

Search features:
- Full-text search on name and description
- Filter by subject, country
- Sort by: relevance, newest, rating (Phase 2)

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| Organization | `IOrganizationRepository` | Global (orgs are globally discoverable) |
| OrganizationSubject | `IOrganizationSubjectRepository` | Org-scoped |
| TeacherApplication | `ITeacherApplicationRepository` | Org-scoped |
| OrganizationInvitation | `IOrganizationInvitationRepository` | Org-scoped |
| OrganizationMembership | `IOrganizationMembershipRepository` | Org-scoped |

`OrganizationPolicy` is embedded in `Organization` (no separate repository).

---

## Prisma Schema

Files in `prisma/schema/` (MySQL / MariaDB): `organization.prisma`, `organization-membership.prisma`, `organization-subject.prisma`, `organization-invitation.prisma`, `teacher-application.prisma`. Array-like fields are `Json`; IDs are plain `String @id` (no `@db.Uuid` on MySQL). The shape below is the target; verify against the files for what is already built.

```prisma
// organization.prisma
model Organization {
  id                         String    @id
  ownerId                    String
  name                       String
  slug                       String    @unique
  description                String?
  logoUrl                    String?
  websiteUrl                 String?
  contactEmail               String
  contactPhone               String?
  country                    String
  timezone                   String
  status                     OrgStatus
  marketplaceListed          Boolean   @default(false)
  acceptingTeachers          Boolean   @default(false)
  acceptingTeachersFor       Json
  // OrganizationPolicy (embedded value object, inline columns)
  minimumBookingNoticeHours  Int       @default(24)
  cancellationWindowHours    Int       @default(48)
  noShowWaitMinutes          Int       @default(15)
  autoRescheduleOnNoShow     Boolean   @default(true)
  lessonPlanRequired         Boolean   @default(false)
  reportRequiredWithinHours  Int       @default(24)
  createdAt                  DateTime  @default(now())
  updatedAt                  DateTime  @updatedAt

  subjects                   OrganizationSubject[]
  memberships                OrganizationMembership[]
  subscriptionPlans          SubscriptionPlan[]
  invitations                OrganizationInvitation[]
  applications               TeacherApplication[]
}

enum OrgStatus {
  pending_approval
  active
  suspended
  rejected
}

model OrganizationSubject {
  id                String   @id
  orgId             String
  name              String
  platformSubjectId String?
  description       String?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())

  org               Organization @relation(fields: [orgId], references: [id])
}

model OrganizationMembership {
  id        String           @id
  orgId     String
  userId    String
  role      OrganizationRole
  subjects  Json
  status    MembershipStatus
  joinedAt  DateTime
  updatedAt DateTime         @updatedAt

  org       Organization @relation(fields: [orgId], references: [id])
}

enum OrganizationRole {
  OrgOwner
  OrgAdmin
  LeadTeacher
  Teacher
  TeachingAssistant
}

enum MembershipStatus {
  active
  inactive
  suspended
}

model TeacherApplication {
  id               String            @id
  orgId            String
  applicantUserId  String
  appliedSubjects  Json
  status           ApplicationStatus
  rejectionReason  String?
  reviewedBy       String?
  reviewedAt       DateTime?
  coverLetter      String?
  qualifications   String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  org              Organization @relation(fields: [orgId], references: [id])
}

enum ApplicationStatus {
  pending_review
  auto_rejected
  approved
  rejected
}

model OrganizationInvitation {
  id             String           @id
  orgId          String
  inviterUserId  String
  inviteeEmail   String
  role           InvitationRole
  subjects       Json
  tokenHash      String
  status         InvitationStatus
  expiresAt      DateTime
  acceptedAt     DateTime?
  createdAt      DateTime         @default(now())

  org            Organization @relation(fields: [orgId], references: [id])
}

enum InvitationRole {
  Teacher
  TeachingAssistant
  parent
}

enum InvitationStatus {
  pending
  accepted
  expired
  revoked
}
```

---

## WebSocket Events (Org Module)

| Event | Namespace | Room | Payload | Who Receives |
|---|---|---|---|---|
| `org:application_received` | /notifications | org:{orgId} | { applicationId, applicantName, subjects } | OrgAdmin, OrgOwner |
| `org:invitation_accepted` | /notifications | org:{orgId} | { invitationId, acceptedBy, role } | OrgAdmin, OrgOwner |
| `org:teacher_approved` | /notifications | user:{userId} | { orgId, orgName, role } | Approved teacher |

---

## API Surface

The organization is identified by the `:organizationId` path param; the caller's `OrganizationMembership` in that org is checked (the access token carries no `orgId`).

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /organizations | Teacher access token | Create organization (caller becomes OrgOwner) — built |
| GET | /organizations/:slug | Public | Get public org profile |
| PATCH | /organizations/:organizationId | OrgAdmin token | Update org profile |
| POST | /organizations/:organizationId/marketplace/list | OrgAdmin token | List org on marketplace |
| DELETE | /organizations/:organizationId/marketplace/list | OrgAdmin token | Delist org from marketplace |
| POST | /organizations/:organizationId/subjects | OrgAdmin token | Add org subject |
| PATCH | /organizations/:organizationId/subjects/:subjectId | OrgAdmin token | Update org subject |
| GET | /organizations/:organizationId/members | OrgAdmin token | List org members |
| POST | /organizations/:organizationId/invitations | OrgAdmin token | Send invitation (teacher or parent) |
| POST | /organizations/invitations/:token/accept | Access token | Accept invitation |
| GET | /organizations/:organizationId/applications | OrgAdmin token | List teacher applications |
| POST | /organizations/:organizationId/applications | Teacher access token | Apply to org via marketplace — built |
| POST | /organizations/:organizationId/applications/:id/approve | OrgAdmin token | Approve teacher application |
| POST | /organizations/:organizationId/applications/:id/reject | OrgAdmin token | Reject with reason |
| GET | /marketplace/organizations | Public | Search marketplace orgs |
| PATCH | /organizations/:organizationId/policy | OrgAdmin token | Update org operational policy |
| PATCH | /organizations/:organizationId/members/:userId/role | OrgOwner token (promoting to OrgAdmin) / OrgAdmin token (other roles) | Change member role |
| DELETE | /organizations/:organizationId/members/:userId | OrgAdmin token | Remove member from org |
