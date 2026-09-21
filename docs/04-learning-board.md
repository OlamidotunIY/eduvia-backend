# 04 — Learning Board

> **Module:** `src/modules/board`
> **Status:** To build.
> **NestJS Module:** `BoardModule`

---

## Overview

The Learning Board is the real-time collaborative workspace at the heart of every Eduvia lesson. It is not a simple whiteboard — it is a structured, mode-driven workspace that enforces access control based on context:

- **Teach Mode** — Teacher writes content; student observes in real-time
- **Classwork Mode** — Teacher attaches questions; student answers during the live lesson
- **Assignment Mode** — Async, not live; student completes work after the lesson with a due date

Each lesson has exactly one board, auto-created when the lesson is created. Teachers can import content (questions, notes) from previous boards.

Real-time sync uses **Operational Transformation (OT)** over Socket.io WebSocket for conflict-free concurrent editing.

---

## Domain Models

### 1. LearningBoard (Aggregate Root)

The persistent workspace for a lesson. Holds all content and controls mode state.

```
LearningBoard
  id:          UUID
  lessonId:    UUID (FK -> Lesson, unique 1:1)
  orgId:       UUID
  mode:        BoardMode (teach | classwork | assignment | review | locked)
  plan:        LessonPlan (embedded — teacher fills this during prep)
  isLocked:    boolean (teacher can lock during class to prevent student editing)
  createdAt:   DateTime
  updatedAt:   DateTime

  sections:    BoardSection[]
  questions:   BoardQuestion[] (questions attached to this board)
```

**Domain Methods:**
- `LearningBoard.create(params)` — creates in `teach` mode; emits `BoardCreatedEvent`
- `board.switchMode(mode, changedBy)` — validates allowed transitions; emits `BoardModeChangedEvent`
- `board.lock()` — teacher locks student editing; emits `BoardLockedEvent`
- `board.unlock()` — unlocks; emits `BoardUnlockedEvent`
- `board.attachQuestion(question, position)` — adds a question from the bank to this board; emits `QuestionAttachedToBoardEvent`
- `board.removeQuestion(questionId)` — removes attached question
- `board.importFromBoard(sourceBoardId, sections)` — imports selected sections from a previous board
- `board.completePlan(plan)` — teacher marks lesson plan as complete; emits `LessonPlanCompletedEvent`

**Mode Transition Rules:**
```
teach       -> classwork  (teacher switches to question-answering mode)
teach       -> locked     (teacher locks to prevent any student input)
classwork   -> teach      (teacher returns to teaching mode)
classwork   -> assignment (teacher releases as homework — lesson must be COMPLETED)
locked      -> teach      (teacher unlocks)
any         -> review     (post-lesson: teacher reviewing student responses)
```

---

### 2. BoardMode (Enum)

```
BoardMode:
  teach       - Teacher writes/presents; students observe only
  classwork   - Students actively answer attached questions (live)
  assignment  - Async student work; separate submission flow with due date
  review      - Teacher reviews student responses; marking in progress
  locked      - Board locked; no student input allowed (temporary freeze)
```

---

### 3. LessonPlan (Embedded Value Object)

Stored inside LearningBoard. Teacher fills this during lesson preparation.

```
LessonPlan
  learningObjectives: string[] (what the student should achieve)
  topicsCovered:      CurriculumNodeRef[] (links to curriculum graph nodes)
  teachingNotes:      string? (private teacher notes — not shown to parents/students)
  homeworkDescription: string? (overview of assignment if one is set)
  isComplete:         boolean
  completedAt:        DateTime?
```

---

### 4. BoardSection (Entity)

A structured content block within the board. OT operations target sections.

```
BoardSection
  id:           UUID
  boardId:      UUID
  type:         text | image | questionBlock | divider
  content:      string (raw text, markdown, or image URL)
  position:     int (ordering index)
  createdBy:    UUID (userId of creator)
  createdAt:    DateTime
  updatedAt:    DateTime
  isTeacherOnly: boolean (if true, only teacher can see/edit — private notes)
```

---

### 5. BoardQuestion (Entity)

A question from the question bank attached to a board, with position and student response tracking.

```
BoardQuestion
  id:              UUID
  boardId:         UUID
  questionId:      UUID (FK -> Question in question bank)
  position:        int
  mode:            classwork | assignment
  assignedAt:      DateTime
  dueAt:           DateTime? (for assignment mode)
  showOptions:     boolean (for MCQ: teacher can hide options to force recall)
  maxMarks:        int
  responses:       StudentResponse[]
```

---

### 6. StudentResponse (Entity)

A student's answer to a question on a board.

```
StudentResponse
  id:              UUID
  boardQuestionId: UUID
  studentId:       UUID (StudentProfile)
  responseType:    text | image_upload | mcq_choice
  textContent:     string? (for short/long answer)
  imageUrl:        string? (for image uploads — stored in S3/R2)
  selectedOption:  string? (for MCQ — the chosen option key)
  submittedAt:     DateTime
  autoMarkResult:  AutoMarkResult? (set immediately for MCQ if options shown)
  teacherMark:     TeacherMark? (set after teacher reviews in MARKING mode)
```

---

### 7. AutoMarkResult (Value Object)

```
AutoMarkResult
  isCorrect:    boolean
  marksAwarded: int
  markedAt:     DateTime
```

---

### 8. TeacherMark (Value Object)

```
TeacherMark
  marksAwarded:  int
  maxMarks:      int
  feedback:      string?
  markedBy:      UUID (teacher userId)
  markedAt:      DateTime
```

---

## OT (Operational Transformation) Architecture

The board uses a **server-authoritative OT model** for real-time sync:

```
Client applies operation locally (optimistic UI)
  |
Client sends: { op, boardId, clientRevision, correlationId }
  |
Server receives op via WebSocket /board namespace
  |
Server checks: serverRevision vs clientRevision
  If clientRevision < serverRevision:
    Transform op against concurrent ops (OT transform)
  Apply transformed op to server state
  Increment serverRevision
  |
Server broadcasts: { op: transformedOp, serverRevision } to board:{boardId} room
  |
All clients apply server op and advance their local revision
```

**OT Operation Types:**

| Op Type | Description |
|---|---|
| `section.insert` | Insert a new section at position |
| `section.delete` | Delete a section by id |
| `section.update` | Update section content (delta-based for text) |
| `section.move` | Reorder section to new position |
| `question.attach` | Attach question to board at position |
| `question.detach` | Remove attached question |
| `question.update` | Update question settings (showOptions, dueAt) |
| `board.lock` | Lock board (mode change) |
| `board.mode_change` | Switch board mode |

---

## Domain Events

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `BoardCreatedEvent` | LearningBoard.create | boardId, lessonId, orgId | (internal) |
| `BoardModeChangedEvent` | board.switchMode | boardId, newMode, changedBy | (WebSocket broadcast via classroom-events) |
| `BoardLockedEvent` | board.lock | boardId | (WebSocket broadcast) |
| `BoardUnlockedEvent` | board.unlock | boardId | (WebSocket broadcast) |
| `QuestionAttachedToBoardEvent` | board.attachQuestion | boardId, questionId, mode | (WebSocket broadcast) |
| `LessonPlanCompletedEvent` | board.completePlan | boardId, lessonId, orgId | classroom-events (unlock LIVE transition if lessonPlanRequired) |
| `StudentResponseSubmittedEvent` | (via WebSocket handler) | boardQuestionId, studentId, responseType | assessment-events (auto-mark MCQ, notify teacher) |
| `TeacherMarkSubmittedEvent` | (via WebSocket handler) | boardQuestionId, studentId, teacherMark | progress-events (update mastery) |

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| A board is always created automatically with its lesson | Classroom module event handler on `LessonCreatedEvent` |
| In Teach Mode, only the teacher can create/edit sections | WebSocket handler checks `board.mode == teach` + validates sender role |
| In Classwork Mode, students can only write responses to questions — not add sections | Mode-based permission check in OT server |
| In locked mode, no writes from any client are accepted | `board.isLocked` checked before any OT op is applied |
| Assignment mode can only be set after the lesson is COMPLETED | `board.switchMode(assignment)` — checks `lesson.status == COMPLETED` |
| A student cannot submit the same response twice | `StudentResponse` has unique constraint on `(boardQuestionId, studentId)` |
| MCQ auto-mark only triggers when `showOptions = true` | `AutoMarkResult` is only computed if question has options and board sets showOptions |
| Image upload responses are stored in S3/R2 — only the URL is stored in DB | Upload handled by a pre-signed URL endpoint; URL saved in `StudentResponse.imageUrl` |
| Teacher marks must be within 0..maxMarks | `TeacherMark` value object validates range |
| Board is read-only once lesson is ARCHIVED | All OT ops rejected if lesson is ARCHIVED |

---

## Business Actions

| Action | Actor | Description |
|---|---|---|
| Prepare lesson plan | Teacher | Fills LessonPlan before lesson; marks as complete |
| Import board content | Teacher | Copies sections/questions from a previous board |
| Attach question from bank | Teacher | Selects question from bank; attaches to board with position and mode |
| Switch to Classwork Mode | Teacher | Changes mode during live lesson to activate student answering |
| Lock board | Teacher | Freezes student input during explanation |
| Unlock board | Teacher | Re-enables student input |
| Student submits classwork response | Student | Submits text, image, or MCQ choice for a board question |
| Teacher auto-marks MCQ | System | Triggered on StudentResponseSubmittedEvent for MCQ with options |
| Teacher manually marks response | Teacher | In MARKING mode, assigns marks + optional feedback per response |
| Switch to Assignment Mode | Teacher | After lesson: releases questions as homework with due date |
| Student submits assignment | Student | Same submission flow as classwork but async; checked against due date |
| Teacher reviews all responses | Teacher | REVIEW mode: sees all student responses per question |

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| LearningBoard | `ILearningBoardRepository` | Org-scoped |
| BoardSection | `IBoardSectionRepository` | Org-scoped |
| BoardQuestion | `IBoardQuestionRepository` | Org-scoped |
| StudentResponse | `IStudentResponseRepository` | Org-scoped |

---

## Prisma Schema (To Add)

```prisma
// board.prisma

model LearningBoard {
  id          String    @id @db.Uuid
  lessonId    String    @unique @db.Uuid
  orgId       String    @db.Uuid
  mode        BoardMode
  isLocked    Boolean   @default(false)
  planObjectives String[]
  planTopicNodeIds String[]
  planNotes   String?
  planHomework String?
  planComplete Boolean  @default(false)
  planCompletedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  sections    BoardSection[]
  questions   BoardQuestion[]
}

enum BoardMode { teach classwork assignment review locked }

model BoardSection {
  id            String   @id @db.Uuid
  boardId       String   @db.Uuid
  type          SectionType
  content       String
  position      Int
  createdBy     String   @db.Uuid
  isTeacherOnly Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  board         LearningBoard @relation(fields: [boardId], references: [id])
}

enum SectionType { text image questionBlock divider }

model BoardQuestion {
  id          String   @id @db.Uuid
  boardId     String   @db.Uuid
  questionId  String   @db.Uuid
  position    Int
  mode        QuestionMode
  assignedAt  DateTime
  dueAt       DateTime?
  showOptions Boolean  @default(true)
  maxMarks    Int

  board       LearningBoard    @relation(fields: [boardId], references: [id])
  responses   StudentResponse[]
}

enum QuestionMode { classwork assignment }

model StudentResponse {
  id               String   @id @db.Uuid
  boardQuestionId  String   @db.Uuid
  studentId        String   @db.Uuid
  responseType     ResponseType
  textContent      String?
  imageUrl         String?
  selectedOption   String?
  submittedAt      DateTime
  autoIsCorrect    Boolean?
  autoMarksAwarded Int?
  autoMarkedAt     DateTime?
  teacherMarksAwarded Int?
  teacherMaxMarks  Int?
  teacherFeedback  String?
  teacherMarkedBy  String?  @db.Uuid
  teacherMarkedAt  DateTime?

  boardQuestion    BoardQuestion @relation(fields: [boardQuestionId], references: [id])

  @@unique([boardQuestionId, studentId])
}

enum ResponseType { text image_upload mcq_choice }
```

---

## WebSocket Events (Board Module)

All events on `/board` namespace, room `board:{boardId}`:

| Event | Direction | Payload | Description |
|---|---|---|---|
| `board:join` | Client -> Server | { boardId, lessonId } | Join board room |
| `board:leave` | Client -> Server | { boardId } | Leave board room |
| `board:op` | Client -> Server | { op, clientRevision, correlationId } | Submit OT operation |
| `board:op:ack` | Server -> Client (sender) | { serverRevision, correlationId } | Op accepted, server revision |
| `board:op:broadcast` | Server -> Room | { op, serverRevision } | Broadcast transformed op to all |
| `board:mode_changed` | Server -> Room | { mode, changedBy } | Mode switched |
| `board:locked` | Server -> Room | { isLocked } | Board locked/unlocked |
| `board:question_attached` | Server -> Room | { boardQuestion } | Question attached |
| `board:response_submitted` | Server -> Room | { boardQuestionId, studentId, responseType } | Response submitted |
| `board:response_marked` | Server -> Room | { boardQuestionId, studentId, mark } | Teacher marked a response |

---

## API Surface (REST — Non-real-time)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /orgs/:orgId/boards/:boardId | Teacher/Student | Get full board state (initial load) |
| POST | /orgs/:orgId/boards/:boardId/plan | Teacher | Save/update lesson plan |
| POST | /orgs/:orgId/boards/:boardId/import | Teacher | Import sections from previous board |
| GET | /orgs/:orgId/boards/:boardId/questions | Teacher/Student | List board questions |
| POST | /boards/:boardId/questions/:bqId/responses | Student | Submit response (REST fallback) |
| GET | /boards/:boardId/questions/:bqId/responses | Teacher | Get all responses for review |
| POST | /boards/:boardId/questions/:bqId/responses/:respId/mark | Teacher | Submit teacher mark |
| POST | /boards/:boardId/upload-url | Student | Get pre-signed S3 upload URL for image response |
