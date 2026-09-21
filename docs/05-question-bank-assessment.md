# 05 — Question Bank & Assessment

> **Module:** `src/modules/assessment`
> **Status:** To build.
> **NestJS Module:** `AssessmentModule`

---

## Overview

The Question Bank & Assessment module manages all questions in Eduvia — their creation, ownership hierarchy, metadata, and the assessment flow from student submission through auto-marking (MCQ) and manual marking (written) to mastery signal generation.

Questions exist in three ownership tiers with cascading visibility:

```
Platform Questions (Super Admin owned, visible to all orgs)
  └── Org Questions (Org-owned, visible to all teachers in that org)
        └── Teacher Questions (Teacher-owned, visible only to that teacher by default)
```

---

## Domain Models

### 1. Question (Aggregate Root)

A question in the bank. Carries rich metadata for curriculum alignment and analytics.

```
Question
  id:               UUID
  ownerType:        platform | org | teacher
  ownerId:          UUID (platform=null, org=orgId, teacher=OrgMembership.id)
  orgId:            UUID? (null for platform-level questions)
  type:             QuestionType
  stem:             string (the question text — markdown supported)
  options:          QuestionOption[]? (for MCQ — can be null for open-ended)
  correctOptionKey: string? (for MCQ — the key of the correct option)
  markScheme:       string? (model answer or marking guidance for written questions)
  maxMarks:         int
  difficultyLevel:  1 | 2 | 3 | 4 | 5 (1=easiest, 5=hardest)
  subject:          string (e.g. "Mathematics")
  curriculumNodeId: UUID? (FK -> CurriculumNode — links to curriculum graph)
  examBoard:        string? (e.g. "AQA", "Edexcel", "IB")
  yearGroup:        string? (e.g. "Year 10", "Grade 8")
  tags:             string[] (free-form tags for searchability)
  provenance:       QuestionProvenance (who created it and how)
  isPublished:      boolean (unpublished questions are drafts)
  usageCount:       int (how many times used across lessons)
  avgScore:         float? (running average student score — updated on each marking)
  correctRate:      float? (% of students who got it right — updated on each marking)
  createdAt:        DateTime
  updatedAt:        DateTime
```

**Domain Methods:**
- `Question.create(params)` — emits `QuestionCreatedEvent`; validates type-specific requirements
- `question.publish()` — sets `isPublished = true`; emits `QuestionPublishedEvent`
- `question.unpublish()` — sets `isPublished = false`
- `question.updateContent(params)` — updates stem, options, markScheme; increments version
- `question.updateMetadata(params)` — updates difficulty, tags, curriculumNodeId
- `question.recordUsage()` — increments `usageCount`
- `question.updateAnalytics(scorePercent, isCorrect)` — updates `avgScore` and `correctRate` rolling averages

**Type-Specific Invariants:**
- MCQ: must have `options` array with >= 2 options AND `correctOptionKey` must match one option key
- Short/Long Answer: must have `markScheme`
- Image Upload: no auto-marking; `correctOptionKey` is null; teacher mark is always required

---

### 2. QuestionType (Enum)

```
QuestionType:
  mcq           - Multiple choice question (auto-markable when options shown)
  short_answer  - Short text response (teacher-marked)
  long_answer   - Extended written response (teacher-marked)
  image_upload  - Student uploads a photo of handwritten work (teacher-marked)
```

---

### 3. QuestionOption (Value Object)

For MCQ questions only.

```
QuestionOption
  key:   string (e.g. "A", "B", "C", "D")
  text:  string (the option text — markdown supported)
  imageUrl: string? (optional image alongside text)
```

---

### 4. QuestionProvenance (Value Object)

Tracks the origin of a question for content licensing compliance.

```
QuestionProvenance
  source:      original | ai_generated | licensed | past_paper
  createdBy:   UUID (userId of author)
  aiModel:     string? (if ai_generated — e.g. "gpt-4o", "gemini-pro")
  licenseRef:  string? (if licensed — license identifier)
  paperRef:    string? (if past_paper — e.g. "AQA GCSE Maths 2023 Paper 1 Q7")
  approvedBy:  UUID? (platform admin who approved licensed/past_paper content)
  approvedAt:  DateTime?
```

---

### 5. Assessment (Aggregate Root)

Represents the complete assessment record for a student on a specific board (lesson or assignment). An Assessment is created when a lesson transitions to COMPLETED — it aggregates all StudentResponses from the board.

```
Assessment
  id:                UUID
  orgId:             UUID
  lessonId:          UUID
  boardId:           UUID
  studentId:         UUID
  status:            pending_marking | partially_marked | fully_marked
  totalMaxMarks:     int (sum of maxMarks for all board questions)
  totalMarksAwarded: int? (sum of marks after full marking)
  scorePercent:      float? (totalMarksAwarded / totalMaxMarks * 100)
  autoMarkedCount:   int (how many MCQ were auto-marked)
  teacherMarkedCount: int
  pendingMarkCount:  int
  createdAt:         DateTime
  updatedAt:         DateTime

  markingItems:      MarkingItem[]
```

**Domain Methods:**
- `Assessment.create(params)` — aggregates all BoardQuestions + StudentResponses; applies auto-marks for MCQ; emits `AssessmentCreatedEvent`
- `assessment.applyTeacherMark(markingItemId, mark)` — records teacher mark; updates counts; emits `AssessmentMarkAppliedEvent`
- `assessment.finalizeMarking()` — when `pendingMarkCount == 0`; calculates final score; emits `AssessmentFinalizedEvent`

---

### 6. MarkingItem (Entity)

One question-response pair within an Assessment, with its marking state.

```
MarkingItem
  id:              UUID
  assessmentId:    UUID
  boardQuestionId: UUID
  studentResponseId: UUID
  questionType:    QuestionType
  maxMarks:        int
  autoMarked:      boolean
  marksAwarded:    int?
  feedback:        string?
  markedBy:        UUID? (teacher userId — null if auto-marked by system)
  markedAt:        DateTime?
  status:          pending | auto_marked | teacher_marked
```

---

### 7. MasteryRecord (Aggregate Root)

Tracks a student's mastery of a specific curriculum node over time. Updated after each assessment finalization.

```
MasteryRecord
  id:              UUID
  studentId:       UUID
  curriculumNodeId: UUID (FK -> CurriculumNode)
  orgId:           UUID
  masteryLevel:    float (0.0 to 1.0 — composite signal)
  teacherAssessedScore: float? (teacher's qualitative mastery assessment 0-1)
  systemCalculatedScore: float? (derived from assessment scores over time)
  assessmentCount: int (number of assessments that contributed to this score)
  lastUpdatedAt:   DateTime

  history:         MasteryHistoryEntry[] (time-series snapshots)
```

**Domain Methods:**
- `MasteryRecord.create(params)` — emits `MasteryRecordCreatedEvent`
- `mastery.updateFromAssessment(scorePercent, teacherAssessment?)` — recalculates masteryLevel using weighted average; emits `MasteryUpdatedEvent`
- `mastery.applyTeacherAssessment(score)` — teacher explicitly sets qualitative mastery (overrides system)

**Mastery Calculation:**
```
systemCalculatedScore = weighted_rolling_average(last 5 assessments, scorePercent)
masteryLevel = (0.6 * systemCalculatedScore) + (0.4 * teacherAssessedScore)
              (if no teacherAssessedScore: masteryLevel = systemCalculatedScore)
```

---

### 8. MasteryHistoryEntry (Value Object)

Time-series snapshot of mastery for trend visualization.

```
MasteryHistoryEntry
  id:            UUID
  masteryRecordId: UUID
  masteryLevel:  float
  trigger:       assessment | teacher_override
  lessonId:      UUID? (lesson that triggered this update)
  recordedAt:    DateTime
```

---

## Domain Events

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `QuestionCreatedEvent` | Question.create | questionId, ownerType, ownerId, type, curriculumNodeId | search-events |
| `QuestionPublishedEvent` | question.publish | questionId | search-events |
| `AssessmentCreatedEvent` | Assessment.create | assessmentId, lessonId, studentId, orgId | assessment-events |
| `AssessmentMarkAppliedEvent` | assessment.applyTeacherMark | assessmentId, markingItemId, marksAwarded | (internal) |
| `AssessmentFinalizedEvent` | assessment.finalizeMarking | assessmentId, studentId, scorePercent, curriculumNodeId | progress-events (update mastery), ai-events |
| `MasteryRecordCreatedEvent` | MasteryRecord.create | masteryRecordId, studentId, curriculumNodeId | progress-events |
| `MasteryUpdatedEvent` | mastery.updateFromAssessment | masteryRecordId, studentId, curriculumNodeId, masteryLevel | progress-events, ai-events (suggest next topic) |

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| MCQ can only be auto-marked if `showOptions = true` on the BoardQuestion | `Assessment.create()` — checks `boardQuestion.showOptions` before applying auto-mark |
| Image upload questions always require teacher marking | `MarkingItem.autoMarked = false` for image_upload type; never auto-marked |
| Short/Long answer questions require teacher marking | Same as image_upload |
| A teacher question is private to its creator unless shared | Visibility filter in `IQuestionRepository.findForOrg()` — includes ownerType=platform, ownerType=org, and ownerType=teacher where ownerId=currentTeacher |
| Platform questions cannot be modified by org or teacher users | `question.updateContent()` — throws `InsufficientPermissionsError` if ownerType=platform and caller is not super admin |
| Org questions can be used but not edited by individual teachers | Same permission model |
| A question cannot be deleted if it has been used in a lesson | `question.delete()` — throws if `usageCount > 0`; soft-delete only |
| Mastery level is always 0.0–1.0 | `MasteryRecord.updateFromAssessment()` — clamps result |
| Teacher assessments override auto-calculated scores with a 40/60 weighting | Mastery calculation formula |

---

## Business Actions

### Question Bank Management

| Action | Actor | Description |
|---|---|---|
| Create question | Platform Admin / OrgAdmin / Teacher | Creates question in their ownership tier |
| Publish question | Owner | Makes question available for use in boards |
| Unpublish question | Owner | Reverts to draft (cannot be used in new boards) |
| Update question content | Owner | Updates stem, options, mark scheme |
| Tag question to curriculum node | Owner | Links question to a CurriculumNode in the graph |
| Search question bank | Teacher | Elasticsearch full-text + filter by subject, difficulty, type, curriculum node |
| Attach question to board | Teacher | Selects from bank, attaches to LearningBoard with position and mode |

### Marking Workflow

| Action | Actor | Description |
|---|---|---|
| Auto-mark MCQ | System | Triggered on `LessonCompletedEvent`; creates Assessment + auto-marks MCQ |
| View marking queue | Teacher | Lists all pending MarkingItems for their lessons |
| Submit teacher mark | Teacher | Applies marks + optional feedback per MarkingItem |
| Finalize assessment | System | Triggered when all MarkingItems are marked; calculates final score |
| Apply teacher mastery override | Teacher | Directly sets qualitative mastery level for a student on a topic |

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| Question | `IQuestionRepository` | Global (platform) + org-scoped (org/teacher questions) |
| Assessment | `IAssessmentRepository` | Org-scoped |
| MarkingItem | `IMarkingItemRepository` | Org-scoped |
| MasteryRecord | `IMasteryRecordRepository` | Global (per student + curriculumNode) |

---

## Prisma Schema (To Add)

```prisma
// question.prisma

model Question {
  id               String   @id @db.Uuid
  ownerType        QuestionOwnerType
  ownerId          String?  @db.Uuid
  orgId            String?  @db.Uuid
  type             QuestionType
  stem             String
  correctOptionKey String?
  markScheme       String?
  maxMarks         Int
  difficultyLevel  Int
  subject          String
  curriculumNodeId String?  @db.Uuid
  examBoard        String?
  yearGroup        String?
  tags             String[]
  provenanceSource ProvenanceSource
  provenanceCreatedBy String @db.Uuid
  provenanceAiModel String?
  provenanceLicenseRef String?
  provenancePaperRef String?
  isPublished      Boolean  @default(false)
  usageCount       Int      @default(0)
  avgScore         Float?
  correctRate      Float?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  options          QuestionOption[]
}

enum QuestionOwnerType { platform org teacher }
enum QuestionType { mcq short_answer long_answer image_upload }
enum ProvenanceSource { original ai_generated licensed past_paper }

model QuestionOption {
  id         String   @id @db.Uuid
  questionId String   @db.Uuid
  key        String
  text       String
  imageUrl   String?

  question   Question @relation(fields: [questionId], references: [id])
}

// assessment.prisma

model Assessment {
  id                  String   @id @db.Uuid
  orgId               String   @db.Uuid
  lessonId            String   @db.Uuid
  boardId             String   @db.Uuid
  studentId           String   @db.Uuid
  status              AssessmentStatus
  totalMaxMarks       Int
  totalMarksAwarded   Int?
  scorePercent        Float?
  autoMarkedCount     Int      @default(0)
  teacherMarkedCount  Int      @default(0)
  pendingMarkCount    Int
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  markingItems        MarkingItem[]
}

enum AssessmentStatus { pending_marking partially_marked fully_marked }

model MarkingItem {
  id                String   @id @db.Uuid
  assessmentId      String   @db.Uuid
  boardQuestionId   String   @db.Uuid
  studentResponseId String   @db.Uuid
  questionType      QuestionType
  maxMarks          Int
  autoMarked        Boolean  @default(false)
  marksAwarded      Int?
  feedback          String?
  markedBy          String?  @db.Uuid
  markedAt          DateTime?
  status            MarkingStatus

  assessment        Assessment @relation(fields: [assessmentId], references: [id])
}

enum MarkingStatus { pending auto_marked teacher_marked }

// mastery.prisma

model MasteryRecord {
  id                     String   @id @db.Uuid
  studentId              String   @db.Uuid
  curriculumNodeId       String   @db.Uuid
  orgId                  String   @db.Uuid
  masteryLevel           Float
  teacherAssessedScore   Float?
  systemCalculatedScore  Float?
  assessmentCount        Int      @default(0)
  lastUpdatedAt          DateTime

  history                MasteryHistoryEntry[]

  @@unique([studentId, curriculumNodeId, orgId])
}

model MasteryHistoryEntry {
  id              String   @id @db.Uuid
  masteryRecordId String   @db.Uuid
  masteryLevel    Float
  trigger         MasteryTrigger
  lessonId        String?  @db.Uuid
  recordedAt      DateTime

  masteryRecord   MasteryRecord @relation(fields: [masteryRecordId], references: [id])
}

enum MasteryTrigger { assessment teacher_override }
```

---

## API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /questions | Teacher/OrgAdmin/SuperAdmin | Create question |
| GET | /questions | Teacher | Search question bank |
| GET | /questions/:id | Teacher | Get question detail |
| PATCH | /questions/:id | Owner | Update question content |
| POST | /questions/:id/publish | Owner | Publish question |
| POST | /questions/:id/unpublish | Owner | Unpublish question |
| GET | /orgs/:orgId/assessments | Teacher/OrgAdmin | List assessments (filterable by status) |
| GET | /orgs/:orgId/assessments/:id | Teacher | Get assessment detail |
| POST | /orgs/:orgId/assessments/:id/items/:itemId/mark | Teacher | Submit teacher mark |
| GET | /students/:studentId/mastery | Teacher/Parent | Get student mastery records |
| POST | /students/:studentId/mastery/:nodeId/override | Teacher | Apply teacher mastery override |
