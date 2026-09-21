# 02 — Organization & Marketplace

> **Module:** `src/modules/org`
> **Status:** To build.
> **NestJS Module:** `OrgModule`

---

## Overview

The Organization & Marketplace module manages everything about tutoring organizations on Eduvia — their creation, configuration, public marketplace presence, teacher hiring (invitation + marketplace application), and student enrollment management.

Organizations are the primary operational unit of Eduvia. Every classroom, lesson, question bank entry, and billing plan exists within an organization context.

---

## Domain Models

### 1. Organization (Aggregate Root)

The central tenant entity. Owns all other org-scoped resources.

```
Organization
  id:                UUID
  ownerId:           UUID (FK -> User — the OrgOwner)
  name:              string
  slug:              string (unique, URL-safe, e.g. "bright-minds-academy")
  description:       string?
  logoUrl:           string?
  websiteUrl:        string?
  contactEmail:      string
  contactPhone:      string?
  country:           string (ISO 3166-1, org's operating country)
  timezone:          string (IANA)
  status:            active | suspended | pending_approval | rejected
  marketplaceListed: boolean (whether they appear in public marketplace)
  acceptingTeachers: boolean (whether the org is open for teacher applications)
  createdAt:         DateTime
  updatedAt:         DateTime

  subjects:          OrgSubject[]
  memberships:       OrgMembership[]
  policies:          OrgPolicy (embedded)
  subscriptionPlans: SubscriptionPlan[]
```

**Domain Methods:**
- `Organization.create(params)` — emits `OrgCreatedEvent`; validates slug uniqueness (at repo level)
- `org.updateProfile(params)` — emits `OrgUpdatedEvent`
- `org.listOnMarketplace()` — sets `marketplaceListed = true`; throws if status != active
- `org.delistFromMarketplace()` — sets `marketplaceListed = false`
- `org.openForTeacherApplications(subjects)` — sets `acceptingTeachers = true` with allowed subjects
- `org.closeTeacherApplications()` — sets `acceptingTeachers = false`
- `org.suspend()` — emits `OrgSuspendedEvent`
- `org.approve()` — sets status to active; emits `OrgApprovedEvent`

---

### 2. OrgSubject (Value Object / Entity)

An org's definition of a subject they offer, linked to a platform-standard subject.

```
OrgSubject
  id:              UUID
  orgId:           UUID
  name:            string (org's own name, e.g. "11+ Maths")
  platformSubjectId: UUID? (FK -> PlatformSubject — optional link to standard)
  description:     string?
  isActive:        boolean
  createdAt:       DateTime
```

**Domain Logic:**
- An OrgSubject can optionally be mapped to a PlatformSubject
- A PlatformSubject is linked to nodes in the Curriculum Graph
- Curriculum resolution flows: Student countryCode -> CurriculumProfile -> CurriculumNode (via PlatformSubject mapping)

---

### 3. OrgPolicy (Embedded Value Object)

Org-level configurable operational rules. Enforced by the system.

```
OrgPolicy
  orgId:                    UUID (1:1 with Organization)
  minimumBookingNoticeHours: int (e.g. 24 — lesson must be booked >= 24h ahead)
  cancellationWindowHours:  int (e.g. 48 — free cancellation within X hours before lesson)
  noShowWaitMinutes:        int (e.g. 15 — teacher waits X min then marks no-show)
  autoRescheduleOnNoShow:   boolean
  lessonPlanRequired:       boolean (teachers must complete plan before LIVE state)
  reportRequiredWithinHours: int (e.g. 24 — report must be submitted within X hours of completion)
  createdAt:                DateTime
  updatedAt:                DateTime
```

---

### 4. TeacherApplication (Aggregate Root)

Represents a teacher's application to join an org via the marketplace.

```
TeacherApplication
  id:               UUID
  orgId:            UUID
  applicantUserId:  UUID (the applying teacher's User ID)
  appliedSubjects:  string[] (subjects teacher is applying to teach)
  status:           pending_review | auto_rejected | approved | rejected
  autoRejected:     boolean
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
- `application.autoReject(reason)` — sets status to `auto_rejected`; emits `TeacherApplicationAutoRejectedEvent`
- `application.approve(reviewerId)` — sets status to `approved`; emits `TeacherApplicationApprovedEvent`
- `application.reject(reviewerId, reason)` — sets status to `rejected`; emits `TeacherApplicationRejectedEvent`

**Auto-Rejection Logic (Domain Service):**
```
AppliedSubjects ∩ Org.acceptedSubjects == ∅ → auto-reject immediately
AppliedSubjects ∩ Org.acceptedSubjects != ∅ → route to admin review queue
```

---

### 5. OrgInvitation (Aggregate Root)

An invitation sent by an org admin to a specific person (teacher or parent).

```
OrgInvitation
  id:             UUID
  orgId:          UUID
  inviterUserId:  UUID (who sent the invitation)
  inviteeEmail:   string
  role:           Teacher | TeachingAssistant | parent (parent invited to enroll student)
  subjects:       string[] (for teacher invitations — which subjects)
  tokenHash:      string (hashed invitation token)
  status:         pending | accepted | expired | revoked
  expiresAt:      DateTime
  acceptedAt:     DateTime?
  createdAt:      DateTime
```

**Domain Methods:**
- `OrgInvitation.create(params)` — emits `OrgInvitationSentEvent`
- `invitation.accept()` — marks accepted; emits `OrgInvitationAcceptedEvent` → creates OrgMembership
- `invitation.revoke()` — marks revoked
- `invitation.expire()` — marks expired (called by cron)
- `invitation.isValid()` — returns false if expired, revoked, or accepted

### 6. OrgMembership (Entity)

Represents a user's role within a specific organization. Managed by the Org domain.

`
OrgMembership
  id:         UUID
  orgId:      UUID (FK -> Organization)
  userId:     UUID (FK -> User)
  role:       OrgOwner | OrgAdmin | LeadTeacher | Teacher | TeachingAssistant
  subjects:   string[] (subjects this teacher is qualified for, empty for admin roles)
  status:     active | inactive | suspended
  joinedAt:   DateTime
  updatedAt:  DateTime
`

**Role Hierarchy (descending permissions):**
`
OrgOwner > OrgAdmin > LeadTeacher > Teacher > TeachingAssistant
`

**Per-role capabilities:**
| Capability | OrgOwner | OrgAdmin | LeadTeacher | Teacher | TA |
|---|---|---|---|---|---|
| Delete org | Yes | - | - | - | - |
| Manage admins | Yes | - | - | - | - |
| Manage teachers | Yes | Yes | - | - | - |
| Review/approve reports | Yes | Yes | Yes | - | - |
| Manage curriculum resources | Yes | Yes | Yes | - | - |
| Run solo lessons | Yes | - | Yes | Yes | - |
| Assist in lessons | Yes | - | Yes | Yes | Yes |
| View all org reports | Yes | Yes | Yes | - | - |

---

## Domain Events

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `OrgCreatedEvent` | Organization.create | orgId, ownerId, name, slug | org-events, search-events |
| `OrgUpdatedEvent` | org.updateProfile | orgId, changedFields | search-events |
| `OrgApprovedEvent` | org.approve | orgId | notification-events (notify org owner) |
| `OrgSuspendedEvent` | org.suspend | orgId | notification-events |
| `OrgListedOnMarketplaceEvent` | org.listOnMarketplace | orgId | search-events (index org publicly) |
| `TeacherApplicationReceivedEvent` | TeacherApplication.create | applicationId, orgId, applicantUserId, subjects | org-events (auto-screen), notification-events |
| `TeacherApplicationAutoRejectedEvent` | application.autoReject | applicationId, orgId, reason | notification-events (email applicant) |
| `TeacherApplicationApprovedEvent` | application.approve | applicationId, orgId, applicantUserId | user-events (create OrgMembership), notification-events |
| `TeacherApplicationRejectedEvent` | application.reject | applicationId, orgId, reason | notification-events |
| `OrgInvitationSentEvent` | OrgInvitation.create | invitationId, orgId, inviteeEmail, role | notification-events (send invite email) |
| `OrgInvitationAcceptedEvent` | invitation.accept | invitationId, orgId, acceptedByUserId, role | org-events (create OrgMembership) |

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| Only active orgs can appear in marketplace | `org.listOnMarketplace()` — throws if status != active |
| Teacher applications auto-rejected if no subject overlap | `TeacherApplicationScreeningService` — compares applied vs accepted subjects |
| An OrgInvitation expires after a configured window (e.g. 7 days) | `invitation.isValid()` checks wall-clock vs `expiresAt` |
| A teacher cannot apply to an org they are already a member of | Checked at application creation (repo-level lookup) |
| An org must have at least one active admin at all times | Enforced when demoting/removing the last admin |
| OrgSubjects can be linked to platform subjects — but not required | OrgSubject.platformSubjectId is nullable |
| Parent enrollment is invitation-only OR self-discovery — both flows create the same StudentEnrollment | Enrollment domain service |

---

## Business Actions

### Org Management

| Action | Description |
|---|---|
| Create organization | OrgOwner registers org; status = `pending_approval`; platform super admin approves |
| Update org profile | OrgAdmin updates name, description, logo, contact info |
| List org on marketplace | OrgAdmin enables public listing; org must be active |
| Open org to teacher applications | OrgAdmin specifies which subjects they are hiring for |
| Configure org policy | OrgAdmin sets cancellation window, no-show wait, lesson plan requirements |
| Add org subject | OrgAdmin creates OrgSubject; optionally maps to PlatformSubject |

### Teacher Hiring

| Action | Description |
|---|---|
| Invite teacher directly | OrgAdmin creates OrgInvitation (email + subjects); system sends invite link |
| Teacher accepts invitation | Teacher (via deep link) accepts → OrgMembership created |
| Teacher applies via marketplace | Applicant submits TeacherApplication for an open org |
| Auto-screen application | System checks subject overlap → auto-reject or route to admin |
| Admin reviews application | OrgAdmin approves or rejects with reason |
| Approved application → create membership | OrgMembership created with Teacher role and approved subjects |
| Promote teacher to LeadTeacher | OrgAdmin changes OrgMembership.role |
| Suspend teacher from org | OrgAdmin sets OrgMembership.status = suspended |
| Remove teacher from org | OrgAdmin deletes OrgMembership (soft-delete with audit) |

### Student Enrollment

| Action | Description |
|---|---|
| Org invites parent | OrgAdmin creates OrgInvitation with role=parent; system sends email |
| Parent discovers org | Parent searches marketplace → views org profile → initiates enrollment |
| Parent enrolls student | Parent links their StudentProfile to an org for a specific OrgSubject |
| Enrollment creates billing context | On enrollment, a SubscriptionPlan selection is triggered |
| Org removes student | OrgAdmin removes StudentEnrollment (deactivates, preserves history) |

---

## Marketplace Features

### Org Marketplace Page (Public)

```
Public Org Profile:
  - Name, slug, description, logo
  - Subjects offered (OrgSubject list)
  - Country / timezone
  - Pricing range (from their SubscriptionPlan min/max)
  - Is accepting teacher applications (with subject filters)
  - Rating + review count (Phase 2)
  - Number of active students (anonymized)
  - Featured teachers (opt-in, Phase 2)
```

### Search & Discovery (Elasticsearch)

Org documents are indexed in Elasticsearch when:
- `OrgCreatedEvent` fires + `OrgListedOnMarketplaceEvent` fires
- `OrgUpdatedEvent` fires → re-index

Index fields: name, description, subjects, country, slug, status (only active+listed searchable publicly)

Search features:
- Full-text search on name and description
- Filter by subject, country
- Sort by: relevance, newest, rating (Phase 2)

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| Organization | `IOrgRepository` | Global (orgs are globally discoverable) |
| OrgSubject | `IOrgSubjectRepository` | Org-scoped |
| TeacherApplication | `ITeacherApplicationRepository` | Org-scoped |
| OrgInvitation | `IOrgInvitationRepository` | Org-scoped |
| OrgMembership | `IOrgMembershipRepository` | Org-scoped |
| OrgPolicy | embedded in Organization or separate 1:1 repo | Org-scoped |

---

## Prisma Schema (To Add)

Files to create in `prisma/schema/`:

```prisma
// org.prisma
model Organization {
  id                 String   @id @db.Uuid
  ownerId            String   @db.Uuid
  name               String
  slug               String   @unique
  description        String?
  logoUrl            String?
  websiteUrl         String?
  contactEmail       String
  contactPhone       String?
  country            String
  timezone           String
  status             OrgStatus
  marketplaceListed  Boolean  @default(false)
  acceptingTeachers  Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  subjects           OrgSubject[]
  memberships        OrgMembership[]
  policy             OrgPolicy?
  subscriptionPlans  SubscriptionPlan[]
  invitations        OrgInvitation[]
  applications       TeacherApplication[]
}

enum OrgStatus {
  pending_approval
  active
  suspended
  rejected
}

model OrgSubject {
  id               String   @id @db.Uuid
  orgId            String   @db.Uuid
  name             String
  platformSubjectId String? @db.Uuid
  description      String?
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())

  org              Organization @relation(fields: [orgId], references: [id])
}

model OrgMembership {
  id        String   @id @db.Uuid
  orgId     String   @db.Uuid
  userId    String   @db.Uuid
  role      OrgRole
  subjects  String[]
  status    MembershipStatus
  joinedAt  DateTime
  updatedAt DateTime @updatedAt

  org       Organization @relation(fields: [orgId], references: [id])
}

enum OrgRole {
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

model OrgPolicy {
  orgId                      String   @id @db.Uuid
  minimumBookingNoticeHours  Int      @default(24)
  cancellationWindowHours    Int      @default(48)
  noShowWaitMinutes          Int      @default(15)
  autoRescheduleOnNoShow     Boolean  @default(true)
  lessonPlanRequired         Boolean  @default(false)
  reportRequiredWithinHours  Int      @default(24)
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt

  org                        Organization @relation(fields: [orgId], references: [id])
}

model TeacherApplication {
  id               String   @id @db.Uuid
  orgId            String   @db.Uuid
  applicantUserId  String   @db.Uuid
  appliedSubjects  String[]
  status           ApplicationStatus
  autoRejected     Boolean  @default(false)
  rejectionReason  String?
  reviewedBy       String?  @db.Uuid
  reviewedAt       DateTime?
  coverLetter      String?
  qualifications   String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  org              Organization @relation(fields: [orgId], references: [id])
}

enum ApplicationStatus {
  pending_review
  auto_rejected
  approved
  rejected
}

model OrgInvitation {
  id             String   @id @db.Uuid
  orgId          String   @db.Uuid
  inviterUserId  String   @db.Uuid
  inviteeEmail   String
  role           InvitationRole
  subjects       String[]
  tokenHash      String
  status         InvitationStatus
  expiresAt      DateTime
  acceptedAt     DateTime?
  createdAt      DateTime @default(now())

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
| `org.application.received` | /notifications | org:{orgId} | { applicationId, applicantName, subjects } | OrgAdmin, OrgOwner |
| `org.invitation.accepted` | /notifications | org:{orgId} | { invitationId, acceptedBy, role } | OrgAdmin, OrgOwner |
| `org.teacher.approved` | /notifications | user:{userId} | { orgId, orgName, role } | Approved teacher |

---

## API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /orgs | Parent/Teacher access token | Create organization |
| GET | /orgs/:slug | Public | Get public org profile |
| PATCH | /orgs/:orgId | OrgAdmin token | Update org profile |
| POST | /orgs/:orgId/marketplace/list | OrgAdmin token | List org on marketplace |
| DELETE | /orgs/:orgId/marketplace/list | OrgAdmin token | Delist org from marketplace |
| POST | /orgs/:orgId/subjects | OrgAdmin token | Add org subject |
| PATCH | /orgs/:orgId/subjects/:subjectId | OrgAdmin token | Update org subject |
| GET | /orgs/:orgId/members | OrgAdmin token | List org members |
| POST | /orgs/:orgId/invitations | OrgAdmin token | Send invitation (teacher or parent) |
| POST | /orgs/invitations/:token/accept | Access token | Accept invitation |
| GET | /orgs/:orgId/applications | OrgAdmin token | List teacher applications |
| POST | /orgs/:orgId/applications/:id/approve | OrgAdmin token | Approve teacher application |
| POST | /orgs/:orgId/applications/:id/reject | OrgAdmin token | Reject with reason |
| POST | /marketplace/orgs/apply | Teacher access token | Apply to org via marketplace |
| GET | /marketplace/orgs | Public | Search marketplace orgs |
| PATCH | /orgs/:orgId/policy | OrgAdmin token | Update org operational policy |
| PATCH | /orgs/:orgId/members/:userId/role | OrgAdmin token | Change member role |
| DELETE | /orgs/:orgId/members/:userId | OrgAdmin token | Remove member from org |

