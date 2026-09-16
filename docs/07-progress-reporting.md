# 07 — Progress & Reporting

> **Module:** `src/modules/progress`
> **Status:** To build.
> **NestJS Module:** `ProgressModule`

---

## Overview

The Progress & Reporting module provides the intelligence layer of Eduvia. It transforms raw lesson activity and assessment data into meaningful progress signals that parents, teachers, and admins can act on.

Core outputs:
- **Lesson Reports** — structured per-lesson summary (teacher-written + AI-drafted) visible to parents
- **Mastery Skill Graph** — continuous graph of student mastery across all curriculum nodes they've been assessed on
- **Progress Trends** — aggregated timeline of scores, attendance, and mastery changes over time
- **Analytics Dashboard** — org-level analytics for admins (teacher performance, student churn risk, completion rates)

---

## Domain Models

### 1. LessonReport (Aggregate Root)

The formal parent-visible record of a lesson. Created when a lesson enters MARKING state. Submitted (and made visible to parent) when lesson reaches REPORTED state.

```
LessonReport
  id:                 UUID
  lessonId:           UUID (FK -> Lesson, unique)
  orgId:              UUID
  classroomId:        UUID
  teacherId:          UUID
  studentId:          UUID
  status:             draft | ai_draft | teacher_reviewing | submitted | archived
  topicsCovered:      CurriculumNodeRef[] (nodes from lesson plan + any added during lesson)
  attendanceStatus:   attended | absent | late | no_show
  teacherNarrative:   string? (free-text teacher summary — private until submitted)
  aiGeneratedSummary: string? (AI draft — teacher reviews and approves)
  teacherApprovedAiSummary: string? (the version teacher approved)
  homeworkSet:        string? (description of assignment set)
  nextSteps:          string? (what will be covered next)
  overallRating:      1 | 2 | 3 | 4 | 5 | null (teacher's assessment of session quality)
  parentCanView:      boolean (true only after status = submitted)
  submittedAt:        DateTime?
  archivedAt:         DateTime?
  createdAt:          DateTime
  updatedAt:          DateTime

  assessmentSummary:  AssessmentSummary (embedded — auto-populated from Assessment)
  parentComments:     ReportComment[]
```

**Domain Methods:**
- `LessonReport.create(params)` — creates in `draft` status; auto-populates from lesson + assessment data
- `report.attachAiSummary(summary)` — sets `aiGeneratedSummary`; transitions to `ai_draft`; emits `ReportAiDraftReadyEvent`
- `report.approvAiSummary()` — teacher approves AI draft; copies to `teacherApprovedAiSummary`
- `report.updateNarrative(text)` — teacher writes/updates their narrative
- `report.submit()` — `teacher_reviewing` -> `submitted`; sets `parentCanView = true`; emits `LessonReportSubmittedEvent`
- `report.archive()` — `submitted` -> `archived`; emits `LessonReportArchivedEvent`
- `report.addParentComment(comment)` — parent adds comment after submission; emits `ParentCommentAddedEvent`
- `report.addAdminReply(comment)` — admin replies to parent comment

---

### 2. AssessmentSummary (Embedded Value Object)

Auto-populated from the Assessment record when the lesson report is created.

```
AssessmentSummary
  totalQuestionsAttempted: int
  totalQuestionsCorrect:   int (for MCQ auto-marked)
  totalMarksAwarded:       int?
  totalMaxMarks:           int
  scorePercent:            float?
  questionBreakdown:       QuestionSummary[] (per-question result summary)
```

---

### 3. QuestionSummary (Value Object)

```
QuestionSummary
  questionId:     UUID
  questionStem:   string (first 100 chars)
  questionType:   QuestionType
  marksAwarded:   int?
  maxMarks:       int
  isCorrect:      boolean? (null for written questions)
  teacherFeedback: string?
```

---

### 4. ReportComment (Entity)

Parent-admin threaded comments on a lesson report.

```
ReportComment
  id:           UUID
  reportId:     UUID
  authorId:     UUID (parent or admin userId)
  authorRole:   parent | admin
  content:      string
  parentCommentId: UUID? (for threaded replies)
  createdAt:    DateTime
  updatedAt:    DateTime
```

---

### 5. StudentProgressSummary (Read Model — not an aggregate)

A computed, cached snapshot of a student's overall progress within an org enrollment. Rebuilt when `MasteryUpdatedEvent` fires.

```
StudentProgressSummary
  studentId:            UUID
  orgId:                UUID
  subjectId:            UUID
  totalLessonsAttended: int
  totalLessonsMissed:   int
  totalAssessments:     int
  averageScorePercent:  float?
  masteredTopicsCount:  int (nodes where masteryLevel >= 0.8)
  inProgressTopicsCount: int (nodes where 0.3 <= masteryLevel < 0.8)
  notStartedTopicsCount: int
  overallMasteryLevel:  float? (weighted average across all nodes)
  lastLessonAt:         DateTime?
  lastUpdatedAt:        DateTime
```

---

### 6. OrgAnalyticsSnapshot (Read Model)

Pre-computed org-level analytics snapshot. Rebuilt on a schedule (e.g., daily cron) and on significant events.

```
OrgAnalyticsSnapshot
  orgId:                     UUID
  snapshotDate:              Date
  totalActiveStudents:       int
  totalActiveTeachers:       int
  totalLessonsThisMonth:     int
  totalLessonsLastMonth:     int
  avgLessonCompletionRate:   float
  avgReportSubmissionTimeHours: float
  teacherPerformance:        TeacherPerformanceStat[]
  studentChurnRisk:          StudentChurnRisk[]
  funnelStats:               EnrollmentFunnelStat
```

---

### 7. TeacherPerformanceStat (Value Object)

```
TeacherPerformanceStat
  teacherId:               UUID
  teacherName:             string
  lessonsDelivered:        int
  avgReportSubmissionHours: float
  avgStudentScorePercent:  float?
  reportCompletionRate:    float
  studentRetentionRate:    float
```

---

### 8. StudentChurnRisk (Value Object)

```
StudentChurnRisk
  studentId:        UUID
  studentName:      string
  riskScore:        float (0.0 - 1.0)
  riskFactors:      string[] (e.g. "3 consecutive absences", "declining scores", "no recent activity")
  lastLessonAt:     DateTime?
```

**Churn Risk Calculation (domain service):**
```
Score increases when:
  - Student missed 2+ consecutive lessons
  - Average score declining over last 4 lessons
  - No lesson in the past 14 days
  - Parent has not viewed reports in 14 days
Score range: 0.0 (no risk) -> 1.0 (high churn risk)
```

---

## Domain Events

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `LessonReportSubmittedEvent` | report.submit | reportId, lessonId, studentId, parentId | notification-events (notify parent) |
| `LessonReportArchivedEvent` | report.archive | reportId | (audit) |
| `ReportAiDraftReadyEvent` | report.attachAiSummary | reportId, teacherId | notification-events (notify teacher to review) |
| `ParentCommentAddedEvent` | report.addParentComment | reportId, commentId, parentId | notification-events (notify admin) |
| `ProgressSummaryUpdatedEvent` | ProgressSummaryService | studentId, orgId, subjectId | (internal — may trigger AI suggestions) |

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| A lesson report is only visible to parents after `status = submitted` | `parentCanView = false` until `report.submit()` is called |
| A teacher cannot submit a report without at least one of: narrative or AI summary | `report.submit()` — throws if both are null/empty |
| Parent comments are only allowed on submitted reports | `report.addParentComment()` — throws if status != submitted |
| Admin replies only; teachers do not communicate directly with parents via reports | Comment `authorRole` restricted to `parent` and `admin` |
| Reports are archived 7 days after submission (never deleted) | Lesson archive cron triggers `report.archive()` |
| `StudentProgressSummary` is eventually consistent — updated via BullMQ job | Does not block the API response; rebuilt asynchronously on `MasteryUpdatedEvent` |
| Churn risk is recalculated daily per org | Cron job triggers `OrgAnalyticsSnapshotService` |

---

## Business Actions

### Lesson Reports

| Action | Actor | Description |
|---|---|---|
| Create report (auto) | System | Created when lesson enters MARKING state |
| Attach AI draft | AI Worker | AI generates summary from lesson board + assessment data |
| Teacher reviews report | Teacher | Views AI draft, edits narrative, sets topics, rating, next steps |
| Teacher approves AI draft | Teacher | Accepts AI summary (possibly edited) |
| Submit report | Teacher | Makes report visible to parent |
| Parent views report | Parent | Sees report card for their child's lesson |
| Parent adds comment | Parent | Asks question or provides feedback on the report |
| Admin replies to comment | Admin | Responds on behalf of the org |

### Progress Queries

| Action | Actor | Description |
|---|---|---|
| View student mastery graph | Teacher/Parent | Full skill graph for a student in a subject |
| View student progress timeline | Teacher/Parent | Historical view of lessons, scores, attendance |
| View student progress summary | Parent | Dashboard card showing overall progress per subject |
| View org analytics | OrgAdmin | Teacher performance, student churn risk, completion rates |
| Export progress report | Parent/OrgAdmin | PDF export of student progress for a given period |

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| LessonReport | `ILessonReportRepository` | Org-scoped |
| ReportComment | `IReportCommentRepository` | Org-scoped |
| StudentProgressSummary | `IStudentProgressSummaryRepository` | Org-scoped (read model) |
| OrgAnalyticsSnapshot | `IOrgAnalyticsSnapshotRepository` | Org-scoped (read model) |

---

## Prisma Schema (To Add)

```prisma
// lesson-report.prisma

model LessonReport {
  id                       String   @id @db.Uuid
  lessonId                 String   @unique @db.Uuid
  orgId                    String   @db.Uuid
  classroomId              String   @db.Uuid
  teacherId                String   @db.Uuid
  studentId                String   @db.Uuid
  status                   ReportStatus
  topicNodeIds             String[]
  attendanceStatus         AttendanceStatus
  teacherNarrative         String?
  aiGeneratedSummary       String?
  teacherApprovedAiSummary String?
  homeworkSet              String?
  nextSteps                String?
  overallRating            Int?
  parentCanView            Boolean  @default(false)
  totalQuestionsAttempted  Int      @default(0)
  totalMarksAwarded        Int?
  totalMaxMarks            Int      @default(0)
  scorePercent             Float?
  submittedAt              DateTime?
  archivedAt               DateTime?
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt

  comments                 ReportComment[]
}

enum ReportStatus { draft ai_draft teacher_reviewing submitted archived }
enum AttendanceStatus { attended absent late no_show }

model ReportComment {
  id              String   @id @db.Uuid
  reportId        String   @db.Uuid
  authorId        String   @db.Uuid
  authorRole      CommentAuthorRole
  content         String
  parentCommentId String?  @db.Uuid
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  report          LessonReport @relation(fields: [reportId], references: [id])
  parent          ReportComment? @relation("CommentThread", fields: [parentCommentId], references: [id])
  replies         ReportComment[] @relation("CommentThread")
}

enum CommentAuthorRole { parent admin }

model StudentProgressSummary {
  id                      String   @id @db.Uuid
  studentId               String   @db.Uuid
  orgId                   String   @db.Uuid
  subjectId               String   @db.Uuid
  totalLessonsAttended    Int      @default(0)
  totalLessonsMissed      Int      @default(0)
  totalAssessments        Int      @default(0)
  averageScorePercent     Float?
  masteredTopicsCount     Int      @default(0)
  inProgressTopicsCount   Int      @default(0)
  notStartedTopicsCount   Int      @default(0)
  overallMasteryLevel     Float?
  lastLessonAt            DateTime?
  lastUpdatedAt           DateTime

  @@unique([studentId, orgId, subjectId])
}
```

---

## WebSocket Events (Progress Module)

| Event | Namespace | Room | Payload | Who Receives |
|---|---|---|---|---|
| `report.ai_draft_ready` | /notifications | user:{teacherId} | { reportId, lessonId } | Teacher |
| `report.submitted` | /notifications | user:{parentId} | { reportId, studentName, lessonDate } | Parent |
| `report.comment_added` | /notifications | org:{orgId} | { reportId, commentId, authorName } | OrgAdmin |

---

## API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /orgs/:orgId/lessons/:lessonId/report | Teacher/Parent | Get lesson report |
| PATCH | /orgs/:orgId/reports/:reportId | Teacher | Update report (narrative, topics, rating) |
| POST | /orgs/:orgId/reports/:reportId/approve-ai | Teacher | Approve AI draft summary |
| POST | /orgs/:orgId/reports/:reportId/submit | Teacher | Submit report (makes visible to parent) |
| POST | /orgs/:orgId/reports/:reportId/comments | Parent/Admin | Add comment to report |
| GET | /students/:studentId/progress | Teacher/Parent | Get student progress summary |
| GET | /students/:studentId/mastery-graph | Teacher/Parent | Get full skill graph |
| GET | /students/:studentId/lesson-history | Teacher/Parent | Get lesson history timeline |
| GET | /orgs/:orgId/analytics | OrgAdmin | Get org analytics snapshot |
| GET | /orgs/:orgId/analytics/churn-risk | OrgAdmin | Get student churn risk list |
| GET | /orgs/:orgId/analytics/teacher-performance | OrgAdmin | Get teacher performance stats |
| GET | /students/:studentId/progress/export | Parent/OrgAdmin | Export progress PDF |
