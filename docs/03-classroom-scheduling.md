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
  subjectId:         UUID (FK -> OrganizationSubject)
  primaryTeacherId:  UUID (FK -> OrganizationMembership)
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

### 3. StudentEnrollment (Aggregate Root)

Tracks which students are enrolled in a classroom (and thus eligible for its lessons). It has its own repository (`IStudentEnrollmentRepository`), so it is an aggregate root.

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
  teacherId:       UUID (OrganizationMembership — may differ from classroom primary teacher if covered)
  coverTeacherId:  UUID? (if a substitute covered this lesson)
  scheduledAt:     DateTime (UTC)
  durationMins:    int
  status:          LessonStatus (state machine — see below)
  meetingId:       string? (provider meeting id — created when the lesson is SCHEDULED)
  videoProvider:   zoom | google_meet | null
  meetLink:        string? (Zoom/Google Meet URL — stored when the meeting is created, delivered to participants when LIVE)
  cancelledReason: string?
  cancelledBy:     UUID?
  noShowAt:        DateTime? (when a no-show was marked)
  noShowType:      student | teacher | null
  startedAt:       DateTime?
  completedAt:     DateTime?
  markedAt:        DateTime?
  reportedAt:      DateTime?
  archivedAt:      DateTime?
  isRecurring:     boolean (false for one-off bookings)
  createdAt:       DateTime
  updatedAt:       DateTime
```

The lesson's board is found through `LearningBoard.lessonId` (unique, see [04-learning-board.md](04-learning-board.md)); the lesson does not store a `boardId`.

**Lesson State Machine:**

```
PENDING -> SCHEDULED -> LIVE -> COMPLETED -> MARKING -> REPORTED -> ARCHIVED
              |           |
              |           +-> STUDENT_NO_SHOW (from LIVE — teacher marks after the no-show wait)
              |
              +-> TEACHER_NO_SHOW (from SCHEDULED — OrgAdmin or student/parent marks after the no-show wait)
              |
              +-> CANCELLED (from PENDING or SCHEDULED only)
```

**Domain Methods:**
- `Lesson.create(params)` — creates in PENDING state; emits `LessonCreatedEvent`
- `lesson.schedule(confirmedBy)` — PENDING -> SCHEDULED; emits `LessonScheduledEvent` (a `meet-events` consumer creates the meeting)
- `lesson.attachMeeting(meetingId, videoProvider, meetLink)` — stores the meeting created for this lesson (called by the classroom module's own `meet-events` processor)
- `lesson.start()` — SCHEDULED -> LIVE; sets `startedAt`; emits `LessonStartedEvent` (no meetLink argument — the link already exists)
- `lesson.complete()` — LIVE -> COMPLETED; sets `completedAt`; emits `LessonCompletedEvent`
- `lesson.beginMarking()` — COMPLETED -> MARKING; sets `markedAt`
- `lesson.markReported()` — MARKING -> REPORTED; sets `reportedAt`; emits `LessonReportedEvent`. Triggered when the report is submitted (the classroom module consumes `LessonReportSubmittedEvent` from `classroom-events`)
- `lesson.archive()` — REPORTED -> ARCHIVED; sets `archivedAt`; emits `LessonArchivedEvent`
- `lesson.cancel(reason, cancelledBy)` — PENDING|SCHEDULED -> CANCELLED; emits `LessonCancelledEvent` (a `meet-events` consumer deletes the meeting)
- `lesson.markStudentNoShow()` — LIVE -> STUDENT_NO_SHOW after `OrganizationPolicy.noShowWaitMinutes`; sets `noShowAt`, `noShowType = student`; emits `LessonStudentNoShowEvent`
- `lesson.markTeacherNoShow(markedBy)` — SCHEDULED -> TEACHER_NO_SHOW after `OrganizationPolicy.noShowWaitMinutes` from `scheduledAt`; sets `noShowAt`, `noShowType = teacher`; emits `LessonTeacherNoShowEvent`
- `lesson.assignCoverTeacher(teacherId)` — sets `coverTeacherId`; emits `CoverTeacherAssignedEvent`

---

### 5. TeacherAvailability (Aggregate Root)

A teacher's recurring availability template — defines when they are bookable.

```
TeacherAvailability
  id:           UUID
  orgId:        UUID
  teacherId:    UUID (OrganizationMembership)
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

### 6. AvailabilitySlot (Entity)

Lives inside the `TeacherAvailability` aggregate; saved and loaded only through it.

```
AvailabilitySlot
  id:        UUID
  dayOfWeek: 0-6
  startTime: string (HH:mm)
  endTime:   string (HH:mm)
  timezone:  string
```

---

### 7. AvailabilityException (Entity)

Lives inside the `TeacherAvailability` aggregate; saved and loaded only through it.

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

Multi-queue routes assume the planned fan-out `OUTBOX_EVENT_ROUTES` (see [00-ddd-architecture.md](00-ddd-architecture.md)).

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `ClassroomCreatedEvent` | Classroom.create | classroomId, orgId, teacherId, subjectId | classroom-events |
| `ClassroomPausedEvent` | classroom.pause | classroomId, orgId | notification-events |
| `ClassroomClosedEvent` | classroom.close | classroomId, orgId | notification-events, billing-events |
| `StudentEnrolledInClassroomEvent` | classroom.addStudent | classroomId, studentId, orgId | notification-events, billing-events |
| `LessonCreatedEvent` | Lesson.create | lessonId, classroomId, orgId, scheduledAt | classroom-events |
| `LessonScheduledEvent` | lesson.schedule | lessonId, orgId, scheduledAt, studentIds | notification-events, billing-events, meet-events (create meeting) |
| `LessonStartedEvent` | lesson.start | lessonId, orgId, meetLink | notification-events, classroom-events (WS broadcast of status + stored link) |
| `LessonCompletedEvent` | lesson.complete | lessonId, orgId, completedAt | assessment-events, notification-events |
| `LessonReportedEvent` | lesson.markReported | lessonId, orgId, reportedAt | progress-events |
| `LessonArchivedEvent` | lesson.archive | lessonId, orgId | (audit) |
| `LessonCancelledEvent` | lesson.cancel | lessonId, orgId, reason, cancelledBy | notification-events, billing-events, meet-events (delete meeting) |
| `LessonStudentNoShowEvent` | lesson.markStudentNoShow | lessonId, orgId, noShowAt | notification-events, billing-events |
| `LessonTeacherNoShowEvent` | lesson.markTeacherNoShow | lessonId, orgId, noShowAt, markedBy | notification-events, billing-events |
| `CoverTeacherAssignedEvent` | lesson.assignCoverTeacher | lessonId, coverTeacherId | notification-events |

`LessonReportSubmittedEvent` is emitted by the lesson report (see [07-progress-reporting.md](07-progress-reporting.md)) and consumed here via `classroom-events` to trigger `lesson.markReported()`.

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
| Student no-show: only from LIVE, marked by the teacher, after OrganizationPolicy.noShowWaitMinutes elapsed from scheduledAt | `lesson.markStudentNoShow()` — wall-clock check |
| Teacher no-show: only from SCHEDULED, marked by an OrgAdmin or the student/parent, after OrganizationPolicy.noShowWaitMinutes elapsed from scheduledAt | `lesson.markTeacherNoShow()` — wall-clock check |
| A meeting is created when the lesson becomes SCHEDULED and deleted when it is cancelled | `meet-events` consumer (classroom module) |
| Lessons are auto-archived 7 days after REPORTED | Background cron job triggers `lesson.archive()` |
| Lessons cannot be modified once ARCHIVED | All domain methods throw `LessonArchivedError` if status == ARCHIVED |
| If `lessonPlanRequired` is true in OrganizationPolicy, teacher must complete LessonPlan before LIVE | `lesson.start()` — checks board plan status |

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
| Confirm lesson | Lesson goes PENDING -> SCHEDULED on parent/admin confirmation; a meeting is created |
| Start lesson | Teacher starts board session -> SCHEDULED -> LIVE; the meeting link is delivered to participants |
| End lesson | Teacher or system ends session -> LIVE -> COMPLETED |
| Begin marking | Teacher enters marking mode -> COMPLETED -> MARKING |
| Submit report | Teacher approves AI draft + submits the report; the lesson then moves MARKING -> REPORTED; visible to parent |
| Cancel lesson | Admin or teacher cancels with reason (meeting deleted); triggers reschedule suggestions if enabled |
| Mark student no-show | Teacher marks the student absent after the wait period (LIVE -> STUDENT_NO_SHOW) |
| Mark teacher no-show | OrgAdmin, or the student/parent, marks the teacher absent after the wait period (SCHEDULED -> TEACHER_NO_SHOW) |
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

`AvailabilitySlot` and `AvailabilityException` have no repositories — they are persisted through `TeacherAvailability`.

---

## Prisma Schema (To Add)

MySQL / MariaDB; IDs are plain `String @id`.

```prisma
// classroom.prisma

model Classroom {
  id                       String   @id
  orgId                    String
  name                     String
  subjectId                String
  primaryTeacherId         String
  status                   ClassroomStatus
  lessonDurationMins       Int
  maxStudents              Int      @default(1)
  recurrenceDayOfWeek      Int
  recurrenceStartTime      String
  recurrenceTimezone       String
  recurrenceIntervalWeeks  Int      @default(1)
  recurrenceEffectiveFrom  DateTime
  recurrenceEffectiveUntil DateTime?
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt

  enrollments              StudentEnrollment[]
  lessons                  Lesson[]
}

enum ClassroomStatus {
  active
  paused
  closed
}

model StudentEnrollment {
  id           String   @id
  classroomId  String
  studentId    String
  orgId        String
  status       EnrollmentStatus
  enrolledAt   DateTime
  removedAt    DateTime?

  classroom    Classroom @relation(fields: [classroomId], references: [id])
}

enum EnrollmentStatus {
  active
  paused
  removed
}

model Lesson {
  id               String   @id
  orgId            String
  classroomId      String
  teacherId        String
  coverTeacherId   String?
  scheduledAt      DateTime
  durationMins     Int
  status           LessonStatus
  meetingId        String?
  videoProvider    VideoProvider?
  meetLink         String?
  cancelledReason  String?
  cancelledBy      String?
  noShowAt         DateTime?
  noShowType       NoShowType?
  startedAt        DateTime?
  completedAt      DateTime?
  markedAt         DateTime?
  reportedAt       DateTime?
  archivedAt       DateTime?
  isRecurring      Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  classroom        Classroom @relation(fields: [classroomId], references: [id])
  board            LearningBoard?   // back-relation; FK lives on LearningBoard.lessonId
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
  STUDENT_NO_SHOW
  TEACHER_NO_SHOW
}

enum VideoProvider {
  zoom
  google_meet
}

enum NoShowType {
  student
  teacher
}

model TeacherAvailability {
  id        String   @id
  orgId     String
  teacherId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  slots      AvailabilitySlot[]
  exceptions AvailabilityException[]
}

model AvailabilitySlot {
  id              String   @id
  availabilityId  String
  dayOfWeek       Int
  startTime       String
  endTime         String
  timezone        String

  availability    TeacherAvailability @relation(fields: [availabilityId], references: [id])
}

model AvailabilityException {
  id             String   @id
  availabilityId String
  date           DateTime
  type           ExceptionType
  startTime      String?
  endTime        String?
  reason         String?

  availability   TeacherAvailability @relation(fields: [availabilityId], references: [id])
}

enum ExceptionType {
  blocked
  added
}
```

---

## WebSocket Events (Classroom Module)

| Event | Namespace | Room | Payload | Who Receives |
|---|---|---|---|---|
| `lesson:status_changed` | /lesson | lesson:{lessonId} | { lessonId, status, updatedAt } | Teacher + enrolled students |
| `lesson:meet_link_ready` | /lesson | lesson:{lessonId} | { lessonId, meetLink } (sent when the lesson goes LIVE) | Teacher + enrolled students |
| `lesson:cover_teacher_assigned` | /lesson | lesson:{lessonId} | { lessonId, coverTeacherName } | Students + parents (via notification) |
| `lesson:cancelled` | /notifications | user:{userId} | { lessonId, classroomName, reason } | Each enrolled student's parent |
| `lesson:student_no_show` | /notifications | org:{orgId} | { lessonId, studentName } | OrgAdmin |
| `lesson:teacher_no_show` | /notifications | org:{orgId} | { lessonId, teacherName } | OrgAdmin |
| `classroom:new_lesson_scheduled` | /notifications | user:{userId} | { classroomId, lessonId, scheduledAt } | Parent + student |

---

## API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /organizations/:organizationId/classrooms | OrgAdmin | Create classroom |
| GET | /organizations/:organizationId/classrooms | OrgAdmin/Teacher | List org classrooms |
| GET | /organizations/:organizationId/classrooms/:classroomId | OrgAdmin/Teacher/Student | Get classroom detail |
| PATCH | /organizations/:organizationId/classrooms/:classroomId | OrgAdmin | Update classroom |
| POST | /organizations/:organizationId/classrooms/:classroomId/pause | OrgAdmin | Pause classroom |
| POST | /organizations/:organizationId/classrooms/:classroomId/close | OrgAdmin | Close classroom |
| POST | /organizations/:organizationId/classrooms/:classroomId/students | OrgAdmin | Add student to classroom |
| DELETE | /organizations/:organizationId/classrooms/:classroomId/students/:studentId | OrgAdmin | Remove student |
| GET | /organizations/:organizationId/lessons | OrgAdmin/Teacher | List lessons (filterable) |
| GET | /organizations/:organizationId/lessons/:lessonId | Teacher/Student/Parent | Get lesson detail |
| POST | /organizations/:organizationId/lessons/:lessonId/start | Teacher | Start lesson (delivers the meeting link) |
| POST | /organizations/:organizationId/lessons/:lessonId/complete | Teacher/System | End lesson |
| POST | /organizations/:organizationId/lessons/:lessonId/cancel | OrgAdmin/Teacher | Cancel lesson |
| POST | /organizations/:organizationId/lessons/:lessonId/student-no-show | Teacher | Mark student no-show |
| POST | /organizations/:organizationId/lessons/:lessonId/teacher-no-show | OrgAdmin/Student/Parent | Mark teacher no-show |
| POST | /organizations/:organizationId/lessons/:lessonId/cover-teacher | OrgAdmin/LeadTeacher | Assign cover teacher |
| GET | /teachers/:teacherId/availability | OrgAdmin/Teacher | Get availability template |
| PUT | /teachers/:teacherId/availability | Teacher | Set full availability template |
| POST | /teachers/:teacherId/availability/exceptions | Teacher | Add exception (block/add slot) |
| DELETE | /teachers/:teacherId/availability/exceptions/:id | Teacher | Remove exception |
| GET | /teachers/:teacherId/available-slots | OrgAdmin | Get available slots in date range |
