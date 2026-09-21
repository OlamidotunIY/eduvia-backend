# 03 — Classroom & Scheduling

> **Module:** `src/modules/classroom`
> **Status:** To build.
> **NestJS Module:** `ClassroomModule`

---

## Overview

The Classroom & Scheduling module manages the permanent educational channels between teachers and students, the individual lesson instances that occur within those channels, teacher availability templates, and the full lesson lifecycle state machine.

A **Classroom** is the persistent relationship object — it defines *who teaches whom, what subject, on what recurring schedule*. A **Lesson** is a single occurrence of that teaching relationship — it can be a scheduled occurrence OR a one-off booking.

---

## Domain Models

### 1. Classroom (Aggregate Root)

The permanent educational channel for a subject between a teacher and one or more students.

```
Classroom
  id:                UUID
  orgId:             UUID (org-scoped)
  name:              string (e.g. "Alice - GCSE Maths")
  subjectId:         UUID (FK -> OrgSubject)
  primaryTeacherId:  UUID (FK -> OrgMembership)
  status:            active | paused | closed
  lessonDurationMins: int (e.g. 60)
  maxStudents:       int (1 for 1:1, N for group — MVP supports both)
  recurrence:        RecurrencePattern (embedded value object)
  createdAt:         DateTime
  updatedAt:         DateTime

  enrollments:       StudentEnrollment[]
  lessons:           Lesson[]
```

**Domain Methods:**
- `Classroom.create(params)` — validates recurrence pattern, emits `ClassroomCreatedEvent`
- `classroom.pause()` — stops generating new lesson slots; emits `ClassroomPausedEvent`
- `classroom.reopen()` — resumes lesson generation
- `classroom.close()` — permanently closes; emits `ClassroomClosedEvent`
- `classroom.changeTeacher(newTeacherId)` — emits `ClassroomTeacherChangedEvent`
- `classroom.addStudent(studentId)` — checks maxStudents; emits `StudentEnrolledInClassroomEvent`
- `classroom.removeStudent(studentId)` — emits `StudentRemovedFromClassroomEvent`
- `classroom.updateRecurrence(pattern)` — emits `ClassroomRecurrenceUpdatedEvent` (affects future lessons only)

---

### 2. RecurrencePattern (Value Object)

Embedded within Classroom — defines when lessons recur.

```
RecurrencePattern
  dayOfWeek:     0-6 (0 = Sunday)
  startTime:     string (HH:mm, in classroom timezone)
  timezone:      string (IANA timezone, e.g. "Europe/London")
  intervalWeeks: int (1 = weekly, 2 = biweekly)
  effectiveFrom: Date (when this pattern starts generating lessons)
  effectiveUntil: Date? (null = indefinite)
```

**Domain Logic:**
- `RecurrencePattern.nextOccurrence(after: Date)` — computes next lesson datetime from pattern
- A classroom may have only one active recurrence pattern at a time
- Changing recurrence never affects already-created lessons — only future lesson generation

---

### 3. StudentEnrollment (Entity)

Tracks which students are enrolled in a classroom (and thus eligible for its lessons).

```
StudentEnrollment
  id:           UUID
  classroomId:  UUID
  studentId:    UUID (FK -> StudentProfile)
  orgId:        UUID
  status:       active | paused | removed
  enrolledAt:   DateTime
  removedAt:    DateTime?
```

**Domain Logic:**
- A student can only be enrolled in classrooms within the same org (or orgs they are associated with)
- A student cannot be enrolled in two classrooms with overlapping lesson times
- Enrollment status `paused` suspends lesson access without removing historical data

---

### 4. Lesson (Aggregate Root)

A single session within a classroom. Has its own full lifecycle state machine.

```
Lesson
  id:              UUID
  orgId:           UUID
  classroomId:     UUID
  teacherId:       UUID (OrgMembership — may differ from classroom primary teacher if covered)
  coverTeacherId:  UUID? (if a substitute covered this lesson)
  boardId:         UUID (FK -> LearningBoard — auto-created with lesson)
  scheduledAt:     DateTime (UTC)
  durationMins:    int
  status:          LessonStatus (state machine — see below)
  meetLink:        string? (Zoom/Google Meet URL — generated when LIVE)
  cancelledReason: string?
  cancelledBy:     UUID?
  noShowAt:        DateTime? (when teacher marked no-show)
  startedAt:       DateTime?
  completedAt:     DateTime?
  markedAt:        DateTime?
  reportedAt:      DateTime?
  archivedAt:      DateTime?
  isRecurring:     boolean (false for one-off bookings)
  createdAt:       DateTime
  updatedAt:       DateTime
```

**Lesson State Machine:**

```
PENDING -> SCHEDULED -> LIVE -> COMPLETED -> MARKING -> REPORTED -> ARCHIVED
                    |                    
                    +-> CANCELLED (from PENDING or SCHEDULED only)
                    |
                    +-> NO_SHOW (from LIVE — teacher marks after no-show wait)
```

**Domain Methods:**
- `Lesson.create(params)` — creates in PENDING state; emits `LessonCreatedEvent`
- `lesson.schedule(confirmedBy)` — PENDING -> SCHEDULED; emits `LessonScheduledEvent`
- `lesson.start(meetLink)` — SCHEDULED -> LIVE; sets `startedAt`, stores meetLink; emits `LessonStartedEvent`
- `lesson.complete()` — LIVE -> COMPLETED; sets `completedAt`; emits `LessonCompletedEvent`
- `lesson.beginMarking()` — COMPLETED -> MARKING; sets `markedAt`
- `lesson.submitReport()` — MARKING -> REPORTED; sets `reportedAt`; emits `LessonReportedEvent`
- `lesson.archive()` — REPORTED -> ARCHIVED; sets `archivedAt`; emits `LessonArchivedEvent`
- `lesson.cancel(reason, cancelledBy)` — PENDING|SCHEDULED -> CANCELLED; emits `LessonCancelledEvent`
- `lesson.markNoShow()` — LIVE -> NO_SHOW after OrgPolicy.noShowWaitMinutes; emits `LessonNoShowEvent`
- `lesson.assignCoverTeacher(teacherId)` — sets `coverTeacherId`; emits `CoverTeacherAssignedEvent`

---

### 5. TeacherAvailability (Aggregate Root)

A teacher's recurring availability template — defines when they are bookable.

```
TeacherAvailability
  id:           UUID
  orgId:        UUID
  teacherId:    UUID (OrgMembership)
  slots:        AvailabilitySlot[] (recurring weekly slots)
  exceptions:   AvailabilityException[] (blocked dates / added one-off slots)
  createdAt:    DateTime
  updatedAt:    DateTime
```

**Domain Methods:**
- `TeacherAvailability.create(params)` — creates template
- `availability.addSlot(slot)` — adds a recurring time block
- `availability.removeSlot(slotId)` — removes a recurring time block
- `availability.addException(exception)` — blocks a specific date/range or adds a one-off slot
- `availability.isAvailableAt(datetime)` — checks if the teacher has an available slot at that datetime accounting for exceptions
- `availability.getAvailableSlots(dateRange)` — returns all available datetimes in a range

---

### 6. AvailabilitySlot (Value Object)

```
AvailabilitySlot
  id:        UUID
  dayOfWeek: 0-6
  startTime: string (HH:mm)
  endTime:   string (HH:mm)
  timezone:  string
```

---

### 7. AvailabilityException (Value Object)

```
AvailabilityException
  id:        UUID
  date:      Date (the specific date)
  type:      blocked | added
  startTime: string? (for added slots)
  endTime:   string?
  reason:    string?
```

---

## Domain Events

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `ClassroomCreatedEvent` | Classroom.create | classroomId, orgId, teacherId, subjectId | classroom-events |
| `ClassroomPausedEvent` | classroom.pause | classroomId, orgId | notification-events |
| `ClassroomClosedEvent` | classroom.close | classroomId, orgId | notification-events, billing-events |
| `StudentEnrolledInClassroomEvent` | classroom.addStudent | classroomId, studentId, orgId | notification-events, billing-events |
| `LessonCreatedEvent` | Lesson.create | lessonId, classroomId, orgId, scheduledAt | classroom-events |
| `LessonScheduledEvent` | lesson.schedule | lessonId, orgId, scheduledAt, studentIds | notification-events, billing-events |
| `LessonStartedEvent` | lesson.start | lessonId, orgId, meetLink | meet-events, notification-events |
| `LessonCompletedEvent` | lesson.complete | lessonId, orgId, completedAt | assessment-events, notification-events |
| `LessonReportedEvent` | lesson.submitReport | lessonId, orgId, reportedAt | notification-events, progress-events |
| `LessonArchivedEvent` | lesson.archive | lessonId, orgId | (audit) |
| `LessonCancelledEvent` | lesson.cancel | lessonId, orgId, reason, cancelledBy | notification-events, billing-events |
| `LessonNoShowEvent` | lesson.markNoShow | lessonId, orgId, noShowAt | notification-events, billing-events |
| `CoverTeacherAssignedEvent` | lesson.assignCoverTeacher | lessonId, coverTeacherId | notification-events |

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| A lesson can only be cancelled from PENDING or SCHEDULED states | `lesson.cancel()` — throws `InvalidLessonStateError` for other states |
| A lesson can only go LIVE from SCHEDULED | `lesson.start()` — throws if status != SCHEDULED |
| Teacher must have an availability slot covering the lesson time | Checked in scheduling domain service before `lesson.schedule()` |
| Classroom cannot exceed maxStudents | `classroom.addStudent()` — throws `ClassroomFullError` |
| A student cannot have two overlapping lessons at the same time | Checked at enrollment + scheduling time (StudentScheduleConflictService) |
| Cover teacher must be an active member of the same org | Checked in `lesson.assignCoverTeacher()` |
| No-show can only be marked after OrgPolicy.noShowWaitMinutes elapsed from scheduledAt | `lesson.markNoShow()` — wall-clock check |
| Lessons are auto-archived 7 days after REPORTED | Background cron job triggers `lesson.archive()` |
| Lessons cannot be modified once ARCHIVED | All domain methods throw `LessonArchivedError` if status == ARCHIVED |
| If `lessonPlanRequired` is true in OrgPolicy, teacher must complete LessonPlan before LIVE | `lesson.start()` — checks board plan status |

---

## Business Actions

### Classroom Operations

| Action | Description |
|---|---|
| Create classroom | OrgAdmin or teacher creates classroom: sets subject, teacher, students, recurrence |
| Generate lesson slots | System cron generates Lesson records from RecurrencePattern (4 weeks rolling horizon) |
| Book one-off lesson | OrgAdmin or parent books a single lesson outside the recurrence pattern |
| Pause classroom | OrgAdmin pauses — stops future lesson generation; active lessons unaffected |
| Close classroom | OrgAdmin permanently closes — sends notification to enrolled students/parents |
| Change primary teacher | OrgAdmin changes classroom teacher; only affects future lessons |
| Assign cover teacher | OrgAdmin or LeadTeacher assigns cover for a specific lesson |
| Add student to classroom | OrgAdmin or parent enrollment triggers `classroom.addStudent()` |
| Remove student from classroom | OrgAdmin removes; preserves historical lesson data |

### Lesson Operations

| Action | Description |
|---|---|
| Confirm lesson | Lesson goes PENDING -> SCHEDULED on parent/admin confirmation |
| Start lesson | Teacher starts board session → triggers Meet link generation → SCHEDULED -> LIVE |
| End lesson | Teacher or system ends session → LIVE -> COMPLETED |
| Begin marking | Teacher enters marking mode → COMPLETED -> MARKING |
| Submit report | Teacher approves AI draft + submits → MARKING -> REPORTED; visible to parent |
| Cancel lesson | Admin or teacher cancels with reason; triggers reschedule suggestions if enabled |
| Mark no-show | Teacher marks student absent after wait period |
| Accept reschedule suggestion | Parent or teacher selects alternative time slot; creates new PENDING lesson |

### Scheduling Operations

| Action | Description |
|---|---|
| Set teacher availability | Teacher configures recurring weekly slots and exceptions |
| Block date | Teacher adds exception to block a specific date/range |
| Add one-off availability | Teacher adds a slot for a date outside their normal template |
| Check availability | System queries `availability.getAvailableSlots()` for booking UI |
| Conflict detection | System rejects scheduling if teacher or student has a conflicting lesson |

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| Classroom | `IClassroomRepository` | Org-scoped |
| Lesson | `ILessonRepository` | Org-scoped |
| StudentEnrollment | `IStudentEnrollmentRepository` | Org-scoped |
| TeacherAvailability | `ITeacherAvailabilityRepository` | Org-scoped |

---

## Prisma Schema (To Add)

```prisma
// classroom.prisma

model Classroom {
  id                String   @id @db.Uuid
  orgId             String   @db.Uuid
  name              String
  subjectId         String   @db.Uuid
  primaryTeacherId  String   @db.Uuid
  status            ClassroomStatus
  lessonDurationMins Int
  maxStudents       Int      @default(1)
  recurrenceDayOfWeek Int
  recurrenceStartTime String
  recurrenceTimezone  String
  recurrenceIntervalWeeks Int @default(1)
  recurrenceEffectiveFrom DateTime
  recurrenceEffectiveUntil DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  enrollments       StudentEnrollment[]
  lessons           Lesson[]
}

enum ClassroomStatus { active paused closed }

model StudentEnrollment {
  id           String   @id @db.Uuid
  classroomId  String   @db.Uuid
  studentId    String   @db.Uuid
  orgId        String   @db.Uuid
  status       EnrollmentStatus
  enrolledAt   DateTime
  removedAt    DateTime?

  classroom    Classroom @relation(fields: [classroomId], references: [id])
}

enum EnrollmentStatus { active paused removed }

model Lesson {
  id               String   @id @db.Uuid
  orgId            String   @db.Uuid
  classroomId      String   @db.Uuid
  teacherId        String   @db.Uuid
  coverTeacherId   String?  @db.Uuid
  boardId          String   @unique @db.Uuid
  scheduledAt      DateTime
  durationMins     Int
  status           LessonStatus
  meetLink         String?
  cancelledReason  String?
  cancelledBy      String?  @db.Uuid
  noShowAt         DateTime?
  startedAt        DateTime?
  completedAt      DateTime?
  markedAt         DateTime?
  reportedAt       DateTime?
  archivedAt       DateTime?
  isRecurring      Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  classroom        Classroom @relation(fields: [classroomId], references: [id])
  board            LearningBoard? @relation(fields: [boardId], references: [id])
}

enum LessonStatus {
  PENDING
  SCHEDULED
  LIVE
  COMPLETED
  MARKING
  REPORTED
  ARCHIVED
  CANCELLED
  NO_SHOW
}

model TeacherAvailability {
  id        String   @id @db.Uuid
  orgId     String   @db.Uuid
  teacherId String   @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  slots      AvailabilitySlot[]
  exceptions AvailabilityException[]
}

model AvailabilitySlot {
  id              String   @id @db.Uuid
  availabilityId  String   @db.Uuid
  dayOfWeek       Int
  startTime       String
  endTime         String
  timezone        String

  availability    TeacherAvailability @relation(fields: [availabilityId], references: [id])
}

model AvailabilityException {
  id             String   @id @db.Uuid
  availabilityId String   @db.Uuid
  date           DateTime
  type           ExceptionType
  startTime      String?
  endTime        String?
  reason         String?

  availability   TeacherAvailability @relation(fields: [availabilityId], references: [id])
}

enum ExceptionType { blocked added }
```

---

## WebSocket Events (Classroom Module)

| Event | Namespace | Room | Payload | Who Receives |
|---|---|---|---|---|
| `lesson.status_changed` | /lesson | lesson:{lessonId} | { lessonId, status, updatedAt } | Teacher + enrolled students |
| `lesson.meet_link_ready` | /lesson | lesson:{lessonId} | { lessonId, meetLink } | Teacher + enrolled students |
| `lesson.cover_teacher_assigned` | /lesson | lesson:{lessonId} | { lessonId, coverTeacherName } | Students + parents (via notification) |
| `lesson.cancelled` | /notifications | user:{userId} | { lessonId, classroomName, reason } | Each enrolled student's parent |
| `lesson.no_show` | /notifications | org:{orgId} | { lessonId, studentName } | OrgAdmin |
| `classroom.new_lesson_scheduled` | /notifications | user:{userId} | { classroomId, lessonId, scheduledAt } | Parent + student |

---

## API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /orgs/:orgId/classrooms | OrgAdmin | Create classroom |
| GET | /orgs/:orgId/classrooms | OrgAdmin/Teacher | List org classrooms |
| GET | /orgs/:orgId/classrooms/:classroomId | OrgAdmin/Teacher/Student | Get classroom detail |
| PATCH | /orgs/:orgId/classrooms/:classroomId | OrgAdmin | Update classroom |
| POST | /orgs/:orgId/classrooms/:classroomId/pause | OrgAdmin | Pause classroom |
| POST | /orgs/:orgId/classrooms/:classroomId/close | OrgAdmin | Close classroom |
| POST | /orgs/:orgId/classrooms/:classroomId/students | OrgAdmin | Add student to classroom |
| DELETE | /orgs/:orgId/classrooms/:classroomId/students/:studentId | OrgAdmin | Remove student |
| GET | /orgs/:orgId/lessons | OrgAdmin/Teacher | List lessons (filterable) |
| GET | /orgs/:orgId/lessons/:lessonId | Teacher/Student/Parent | Get lesson detail |
| POST | /orgs/:orgId/lessons/:lessonId/start | Teacher | Start lesson (triggers meet link) |
| POST | /orgs/:orgId/lessons/:lessonId/complete | Teacher/System | End lesson |
| POST | /orgs/:orgId/lessons/:lessonId/cancel | OrgAdmin/Teacher | Cancel lesson |
| POST | /orgs/:orgId/lessons/:lessonId/no-show | Teacher | Mark no-show |
| POST | /orgs/:orgId/lessons/:lessonId/cover-teacher | OrgAdmin/LeadTeacher | Assign cover teacher |
| GET | /teachers/:teacherId/availability | OrgAdmin/Teacher | Get availability template |
| PUT | /teachers/:teacherId/availability | Teacher | Set full availability template |
| POST | /teachers/:teacherId/availability/exceptions | Teacher | Add exception (block/add slot) |
| DELETE | /teachers/:teacherId/availability/exceptions/:id | Teacher | Remove exception |
| GET | /teachers/:teacherId/available-slots | OrgAdmin | Get available slots in date range |
