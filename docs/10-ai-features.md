# 10 — AI Features

> **Module:** `src/modules/ai`
> **Status:** To build.
> **NestJS Module:** `AIModule`

---

## Overview

AI is a first-class feature of Eduvia — not a bolt-on. It is integrated across multiple domains to reduce teacher workload and improve educational outcomes. All AI operations run asynchronously via BullMQ workers consuming domain events.

AI providers are abstracted behind ports (IAIPort) to allow provider swapping without domain logic changes. The MVP targets OpenAI GPT-4o and Google Gemini Pro.

**The three core AI capabilities:**
1. **Report Summarization** — AI reads lesson board content + assessment data and drafts a parent-friendly lesson report
2. **Question Generation** — AI generates curriculum-aligned questions for a given topic node with full metadata
3. **Next-Lesson Suggestion** — AI analyzes a student's mastery graph and recommends what to focus on next

---

## Design Principles

- **AI output is never shown to parents without teacher approval.** All AI-generated content is a draft.
- **AI output is transparent.** All AI-generated questions are marked with `provenance: ai_generated` and the model used.
- **AI failures never block the user.** If AI fails, the teacher writes the report manually. Graceful degradation always.
- **Prompts are versioned.** Prompt templates are stored in the DB and versioned so output can be reproduced/audited.
- **AI workers are idempotent.** Re-running a job with the same inputs produces the same draft (deterministic temperature=0 or low).

---

## Domain Models

### 1. AIJob (Aggregate Root)

Tracks every AI request for auditability and retry management.

```
AIJob
  id:               UUID
  type:             report_summary | question_generation | next_lesson_suggestion
  status:           queued | processing | completed | failed | cancelled
  inputPayload:     JSON (the data passed to the AI)
  outputPayload:    JSON? (the AI's response)
  provider:         openai | gemini
  model:            string (e.g. "gpt-4o", "gemini-2.0-flash")
  promptVersion:    string (which prompt template version was used)
  tokensUsed:       int? (for cost tracking)
  errorMessage:     string? (if failed)
  relatedEntityId:  UUID (lessonId for reports, curriculumNodeId for questions, studentId for suggestions)
  relatedEntityType: lesson | curriculum_node | student
  orgId:            UUID
  requestedBy:      UUID? (userId who triggered the AI, or null for system-triggered)
  createdAt:        DateTime
  completedAt:      DateTime?
  updatedAt:        DateTime
```

**Domain Methods:**
- `AIJob.create(params)` — emits `AIJobCreatedEvent`
- `job.markProcessing()` — status = processing
- `job.complete(output)` — status = completed; emits `AIJobCompletedEvent`
- `job.fail(error)` — status = failed; emits `AIJobFailedEvent`
- `job.cancel()` — status = cancelled

---

### 2. AIPromptTemplate (Entity)

Versioned prompt templates. Maintained by platform super admins. Enables audit and reproducibility.

```
AIPromptTemplate
  id:          UUID
  name:        string (e.g. "lesson_report_summary_v2")
  type:        report_summary | question_generation | next_lesson_suggestion
  version:     string
  systemPrompt: string
  userPromptTemplate: string (handlebars-style template with {{variables}})
  isActive:    boolean (only one active version per type)
  createdAt:   DateTime
  deprecatedAt: DateTime?
```

---

## AI Feature 1: Report Summarization

### Trigger
- Event: `LessonCompletedEvent` → consumed by `ai-events` queue → `ReportSummaryWorker`

### Input Data (compiled from multiple domains)
```json
{
  "lesson": { "scheduledAt", "durationMins", "subject", "curriculumNodes" },
  "boardSections": [ { "type", "content" } ],
  "assessmentSummary": {
    "totalMarksAwarded", "totalMaxMarks", "scorePercent",
    "questions": [ { "stem", "marksAwarded", "maxMarks", "isCorrect", "feedback" } ]
  },
  "studentName": "...",
  "teacherName": "...",
  "previousReportSummary": "..."  // for continuity
}
```

### Output (stored as AI draft on LessonReport)
```json
{
  "summary": "Alice had a productive lesson today covering quadratic equations...",
  "strengths": ["...", "..."],
  "areasForImprovement": ["...", "..."],
  "nextSteps": "..."
}
```

### Teacher Review Flow
```
AI draft ready -> board.attachAiSummary(summary) 
-> ReportAiDraftReadyEvent 
-> Notification to teacher 
-> Teacher reviews, edits if needed, approves 
-> report.submit()
```

---

## AI Feature 2: Question Generation

### Trigger
- Manual: Teacher requests generation for a specific curriculum node
- Automatic: After org reaches a curriculum node coverage threshold below a configured minimum

### Input Data
```json
{
  "curriculumNode": { "name", "code", "description", "depth", "gradeLevel" },
  "curriculumProfile": { "name", "authority" },
  "subject": "...",
  "questionType": "mcq | short_answer | long_answer",
  "difficultyLevel": 3,
  "count": 5,
  "existingQuestions": [ { "stem" } ]  // to avoid duplicates
}
```

### Output
```json
{
  "questions": [
    {
      "stem": "Solve: x² - 5x + 6 = 0",
      "type": "short_answer",
      "markScheme": "x = 2 or x = 3. Award 1 mark for correct method...",
      "maxMarks": 3,
      "difficultyLevel": 3,
      "options": null
    }
  ]
}
```

### Post-Processing
- Each generated question is created in the Question Bank with `provenance: ai_generated`
- Status defaults to `isPublished: false` (teacher/admin reviews before using)
- Super admin can approve AI questions for platform-level publishing

---

## AI Feature 3: Next-Lesson Suggestion

### Trigger
- Event: `MasteryUpdatedEvent` → consumed by `ai-events` queue → `NextLessonSuggestionWorker`
- Manual: Teacher requests suggestion for a student

### Input Data
```json
{
  "student": { "name", "gradeLevel", "countryCode" },
  "curriculum": { "name", "shortCode" },
  "subject": "...",
  "masteryGraph": [
    { "nodeName", "nodeCode", "masteryLevel", "assessmentCount", "lastAssessedAt" }
  ],
  "recentLessons": [
    { "topicsCoNovered", "scorePercent", "teacherNarrative" }
  ]
}
```

### Output
```json
{
  "suggestion": {
    "curriculumNodeId": "...",
    "nodeName": "Quadratic Inequalities",
    "rationale": "Alice has strong mastery of quadratic equations (0.85) but has not yet covered inequalities, which is the natural next progression.",
    "prerequisitesMet": true,
    "recommendedQuestions": ["question-id-1", "question-id-2"]
  },
  "alternativeSuggestions": [...]
}
```

### Delivery
- Suggestion is attached to the teacher's lesson planning workspace
- Teacher sees "AI Suggested Topic" card when creating the next lesson plan
- Teacher can accept or dismiss

---

## Domain Events

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `AIJobCreatedEvent` | AIJob.create | jobId, type, relatedEntityId | ai-events |
| `AIJobCompletedEvent` | job.complete | jobId, type, output, relatedEntityId | Varies by type (e.g. classroom-events for report) |
| `AIJobFailedEvent` | job.fail | jobId, type, errorMessage | notification-events (notify teacher AI failed, submit manually) |

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| Only one active AI job of each type per related entity at a time | Unique constraint on `(type, relatedEntityId, status=queued OR processing)` |
| AI-generated questions start as unpublished | `question.isPublished = false` on creation from AI output |
| AI summaries are never sent to parents without teacher approval | `LessonReport.parentCanView = false` until `report.submit()` is called |
| AI failures trigger graceful degradation — teacher notified to proceed manually | `AIJobFailedEvent` sends notification; LessonReport created without AI summary |
| Token usage is tracked per job for cost monitoring | `AIJob.tokensUsed` updated on job completion |
| Prompt templates have exactly one active version per type | `AIPromptTemplate.isActive` — unique partial index on `(type, isActive=true)` |

---

## Business Actions

| Action | Actor | Description |
|---|---|---|
| Trigger report summary | System | Auto-triggered on `LessonCompletedEvent` |
| Request question generation | Teacher/OrgAdmin | Manually request N questions for a curriculum node |
| Request next-lesson suggestion | Teacher | Request topic suggestion for a student |
| Approve AI report draft | Teacher | Accepts AI-generated summary for the report |
| Edit AI report draft | Teacher | Modifies AI draft before approval |
| Review AI questions | Teacher/OrgAdmin | Review generated questions; publish those that are good |
| View AI job status | Teacher | Check if AI processing is complete |
| Manage prompt templates | SuperAdmin | Create/update/deprecate AI prompt templates |
| View AI cost summary | SuperAdmin | See token usage + cost per org per month |

---

## Infrastructure Ports

```
IAIPort
  generateText(params: { prompt, model, maxTokens, temperature }): Promise<AIResponse>
  
IAIProviderFactory
  getProvider(provider: 'openai' | 'gemini'): IAIPort
```

**Implementations:**
- `OpenAIAdapter` — wraps OpenAI SDK (GPT-4o)
- `GeminiAdapter` — wraps Google Generative AI SDK (Gemini Pro)

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| AIJob | `IAIJobRepository` | Org-scoped |
| AIPromptTemplate | `IAIPromptTemplateRepository` | Global |

---

## Prisma Schema (To Add)

```prisma
// ai.prisma

model AIJob {
  id                String   @id @db.Uuid
  type              AIJobType
  status            AIJobStatus
  inputPayload      Json
  outputPayload     Json?
  provider          AIProvider
  model             String
  promptVersion     String
  tokensUsed        Int?
  errorMessage      String?
  relatedEntityId   String   @db.Uuid
  relatedEntityType AIEntityType
  orgId             String   @db.Uuid
  requestedBy       String?  @db.Uuid
  createdAt         DateTime @default(now())
  completedAt       DateTime?
  updatedAt         DateTime @updatedAt
}

enum AIJobType { report_summary question_generation next_lesson_suggestion }
enum AIJobStatus { queued processing completed failed cancelled }
enum AIProvider { openai gemini }
enum AIEntityType { lesson curriculum_node student }

model AIPromptTemplate {
  id                  String   @id @db.Uuid
  name                String
  type                AIJobType
  version             String
  systemPrompt        String
  userPromptTemplate  String
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  deprecatedAt        DateTime?

  @@unique([type, version])
}
```

---

## API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /ai/questions/generate | Teacher/OrgAdmin | Request question generation for a node |
| POST | /ai/suggestions/next-lesson | Teacher | Request next-lesson suggestion for a student |
| GET | /ai/jobs/:jobId | Teacher/Admin | Get AI job status and result |
| GET | /ai/jobs | OrgAdmin | List AI jobs for the org |
| GET | /ai/prompt-templates | SuperAdmin | List prompt templates |
| POST | /ai/prompt-templates | SuperAdmin | Create prompt template |
| PATCH | /ai/prompt-templates/:id | SuperAdmin | Update prompt template |
| POST | /ai/prompt-templates/:id/deprecate | SuperAdmin | Deprecate a prompt template version |
| GET | /ai/cost-summary | SuperAdmin | Token usage + cost by org |
