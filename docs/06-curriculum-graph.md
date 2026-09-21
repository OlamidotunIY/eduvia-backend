# 06 — Curriculum Graph

> **Module:** `src/modules/curriculum`
> **Status:** To build.
> **NestJS Module:** `CurriculumModule`

---

## Overview

The Curriculum Graph is a platform-wide hierarchical data structure that maps out the academic content frameworks of different countries and exam boards. Every question, lesson plan topic, and mastery record is anchored to a node in this graph.

The graph enables:
- **Curriculum-aware lesson planning** — teachers browse and tag topics
- **Curriculum-aware question bank** — questions are linked to specific topic nodes
- **Mastery skill graphs** — student progress visualized against curriculum nodes
- **Student curriculum resolution** — student country code maps to their curriculum

The curriculum graph is maintained by **Platform Super Admins** and **dedicated Curriculum Editors** (a platform-level role). Org admins cannot modify the graph but can map their org subjects to platform subjects and curriculum nodes.

---

## Curriculum Hierarchy

The hierarchy is designed to be flexible enough to accommodate different national systems. All curricula follow the same hierarchical depth, though node names vary by system:

```
Country (e.g. United Kingdom)
  └── Curriculum (e.g. England National Curriculum)
        └── KeyStage / Phase (e.g. Key Stage 4 / KS4)
              └── Subject (e.g. Mathematics)
                    └── Strand / Domain (e.g. Number, Algebra, Geometry)
                          └── Topic (e.g. Quadratic Equations)
                                └── LearningObjective (e.g. "Solve quadratic equations by factorisation")
```

---

## Domain Models

### 1. CurriculumProfile (Aggregate Root)

The top-level curriculum entity, tied to a country and an educational standard.

```
CurriculumProfile
  id:          UUID
  name:        string (e.g. "England National Curriculum", "International Baccalaureate", "Ontario Curriculum")
  shortCode:   string (e.g. "UK-NC", "IB", "CA-ON")
  countryCode: string (ISO 3166-1, e.g. "GB", "CA", "NG")
  description: string?
  authority:   string (e.g. "Department for Education", "IBO", "Ontario Ministry of Education")
  isActive:    boolean
  version:     string? (e.g. "2023", "May 2024")
  createdAt:   DateTime
  updatedAt:   DateTime
```

**Domain Methods:**
- `CurriculumProfile.create(params)` — emits `CurriculumCreatedEvent`
- `curriculum.activate()` — makes the curriculum visible and usable
- `curriculum.deactivate()` — hides from selection (does not delete existing data)
- `curriculum.update(params)` — updates description, authority, version

---

### 2. CurriculumNode (Aggregate Root)

A node in the curriculum hierarchy. Can represent any level (KeyStage, Subject, Strand, Topic, LearningObjective). The level is explicit via `nodeType`.

```
CurriculumNode
  id:             UUID
  curriculumId:   UUID (FK -> CurriculumProfile)
  parentNodeId:   UUID? (null = root node for this curriculum)
  nodeType:       keystage | subject | strand | topic | learning_objective
  name:           string (e.g. "Quadratic Equations")
  code:           string? (official curriculum code, e.g. "A2.3.4")
  description:    string?
  gradeLevel:     string? (e.g. "Year 10", "Grade 8", "IB HL")
  depth:          int (0 = KeyStage, 1 = Subject, 2 = Strand, 3 = Topic, 4 = LearningObjective)
  path:           string (materialized path for efficient subtree queries, e.g. "/root-id/subject-id/strand-id/")
  isLeaf:         boolean (true for LearningObjective nodes — where mastery is tracked)
  isActive:       boolean
  createdAt:      DateTime
  updatedAt:      DateTime

  children:       CurriculumNode[]
  questions:      Question[] (questions tagged to this node)
```

**Domain Methods:**
- `CurriculumNode.create(params)` — emits `CurriculumNodeCreatedEvent`; auto-computes `path` and `depth` from parent
- `node.update(params)` — updates name, description, code
- `node.deactivate()` — hides node and all descendants from selection
- `node.activate()` — re-enables node

**Path Strategy (Materialized Path):**
The `path` field stores the ancestor chain as a string (`/grandparent-id/parent-id/`) enabling fast subtree queries with a simple `LIKE '/root-id%'` filter. This avoids recursive CTEs for tree traversal in most common use cases.

---

### 3. PlatformSubject (Entity)

A standardized subject definition that orgs can link their OrgSubjects to. Not a curriculum-specific entity — it's a cross-curriculum standard.

```
PlatformSubject
  id:          UUID
  name:        string (e.g. "Mathematics", "English Language", "Physics")
  shortCode:   string (e.g. "MATH", "ENG", "PHY")
  description: string?
  isActive:    boolean
  createdAt:   DateTime
```

**Relationships:**
- An `OrgSubject` can link to a `PlatformSubject`
- A `PlatformSubject` can be linked to multiple `CurriculumNode`s (one per curriculum) via `SubjectCurriculumMapping`

---

### 4. SubjectCurriculumMapping (Entity)

Maps a PlatformSubject to the root subject node within a specific curriculum.

```
SubjectCurriculumMapping
  id:               UUID
  platformSubjectId: UUID (FK -> PlatformSubject)
  curriculumId:     UUID (FK -> CurriculumProfile)
  subjectNodeId:    UUID (FK -> CurriculumNode where nodeType = subject)
  createdAt:        DateTime
```

**Purpose:**
When a student's `countryCode` is resolved to a `CurriculumProfile`, the system uses `SubjectCurriculumMapping` to find the correct subject node within that curriculum, then traverses the subtree to load all topics for that student's mastery graph.

---

## Student Curriculum Resolution Flow

```
1. Student is enrolled in a classroom for OrgSubject "11+ Maths"
2. OrgSubject is mapped to PlatformSubject "Mathematics"
3. StudentProfile.countryCode = "GB" -> resolves to CurriculumProfile "UK-NC"
4. SubjectCurriculumMapping finds CurriculumNode (Mathematics, KS2, UK-NC)
5. All LearningObjective leaf nodes under that subject node form the student's mastery map
6. As assessments complete, MasteryRecord entries are created per leaf node
```

---

## Domain Events

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `CurriculumCreatedEvent` | CurriculumProfile.create | curriculumId, name, countryCode | search-events |
| `CurriculumNodeCreatedEvent` | CurriculumNode.create | nodeId, curriculumId, parentNodeId, nodeType | search-events |
| `CurriculumNodeUpdatedEvent` | node.update | nodeId | search-events |
| `CurriculumNodeDeactivatedEvent` | node.deactivate | nodeId | search-events |

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| A CurriculumNode's `depth` is always parentNode.depth + 1 | Computed in `CurriculumNode.create()` |
| A CurriculumNode's `path` includes all ancestor IDs | Computed in `CurriculumNode.create()` using parent's path |
| Mastery is only tracked at `isLeaf = true` nodes (LearningObjectives) | `MasteryRecord.create()` validates `node.isLeaf == true` |
| A student can only have one CurriculumProfile (resolved from countryCode) | `StudentProfile.countryCode` is the single source of truth |
| Deactivating a node cascades deactivation to all descendants | `node.deactivate()` triggers `CASCADE_DEACTIVATE` on children (background job) |
| Org admins and teachers cannot create or modify curriculum nodes | Super Admin + Curriculum Editor only |
| Questions can only be tagged to `isLeaf = true` nodes | `Question.create()` — validates `curriculumNode.isLeaf == true` if `curriculumNodeId` is provided |

---

## Business Actions

### Curriculum Administration (Super Admin / Curriculum Editor)

| Action | Description |
|---|---|
| Create curriculum profile | Define a new national curriculum (UK, IB, Ontario CA, etc.) |
| Add curriculum node | Add a node at any level of the hierarchy |
| Bulk import curriculum | CSV/JSON import of a full curriculum hierarchy |
| Update node name/code | Correct or update a curriculum node |
| Deactivate node | Hide a node (and descendants) from user selection |
| Create PlatformSubject | Define a standard subject (Mathematics, English, etc.) |
| Map subject to curriculum node | Link PlatformSubject to its root node in a specific curriculum |

### Browse & Search (Teachers / Platform)

| Action | Description |
|---|---|
| Browse curriculum tree | Navigate the hierarchy for a given curriculum |
| Search curriculum nodes | Elasticsearch full-text search on node name and code |
| Get node with subtree | Retrieve a node + all descendants (for mastery map rendering) |
| Get student curriculum | Resolve a student's curriculum from countryCode + subject enrollment |

---

## Seeded Curricula (MVP)

| Curriculum | Country | Key Stages / Phases |
|---|---|---|
| England National Curriculum | GB | KS1 (Yr 1-2), KS2 (Yr 3-6), KS3 (Yr 7-9), KS4 (Yr 10-11 / GCSE) |
| A-Level (England) | GB | Year 12-13 (AS / A2) |
| International Baccalaureate (MYP + DP) | International | MYP (Yr 6-10), DP (Yr 11-12) |
| Ontario Curriculum | CA (Ontario) | Grade 1-12 |

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| CurriculumProfile | `ICurriculumProfileRepository` | Global |
| CurriculumNode | `ICurriculumNodeRepository` | Global |
| PlatformSubject | `IPlatformSubjectRepository` | Global |
| SubjectCurriculumMapping | `ISubjectCurriculumMappingRepository` | Global |

---

## Prisma Schema (To Add)

```prisma
// curriculum.prisma

model CurriculumProfile {
  id          String   @id @db.Uuid
  name        String
  shortCode   String   @unique
  countryCode String
  description String?
  authority   String
  isActive    Boolean  @default(true)
  version     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  nodes       CurriculumNode[]
  mappings    SubjectCurriculumMapping[]
}

model CurriculumNode {
  id             String   @id @db.Uuid
  curriculumId   String   @db.Uuid
  parentNodeId   String?  @db.Uuid
  nodeType       NodeType
  name           String
  code           String?
  description    String?
  gradeLevel     String?
  depth          Int
  path           String   // materialized path e.g. "/parent-id/grandparent-id/"
  isLeaf         Boolean  @default(false)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  curriculum     CurriculumProfile @relation(fields: [curriculumId], references: [id])
  parent         CurriculumNode?   @relation("NodeHierarchy", fields: [parentNodeId], references: [id])
  children       CurriculumNode[]  @relation("NodeHierarchy")

  @@index([curriculumId, depth])
  @@index([path])
}

enum NodeType { keystage subject strand topic learning_objective }

model PlatformSubject {
  id          String   @id @db.Uuid
  name        String
  shortCode   String   @unique
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  mappings    SubjectCurriculumMapping[]
}

model SubjectCurriculumMapping {
  id                String   @id @db.Uuid
  platformSubjectId String   @db.Uuid
  curriculumId      String   @db.Uuid
  subjectNodeId     String   @db.Uuid
  createdAt         DateTime @default(now())

  platformSubject   PlatformSubject   @relation(fields: [platformSubjectId], references: [id])
  curriculum        CurriculumProfile @relation(fields: [curriculumId], references: [id])

  @@unique([platformSubjectId, curriculumId])
}
```

---

## API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /curricula | Public | List all active curricula |
| GET | /curricula/:id | Teacher/Admin | Get curriculum detail |
| GET | /curricula/:id/tree | Teacher/Admin | Get full curriculum node tree |
| GET | /curricula/:id/nodes | Teacher/Admin | List nodes with optional depth filter |
| GET | /curriculum-nodes/:nodeId | Teacher/Admin | Get node + children |
| GET | /curriculum-nodes/search | Teacher | Elasticsearch search on nodes |
| POST | /curricula | SuperAdmin | Create curriculum profile |
| POST | /curricula/:id/nodes | SuperAdmin/CurriculumEditor | Add curriculum node |
| PATCH | /curriculum-nodes/:nodeId | SuperAdmin/CurriculumEditor | Update node |
| POST | /curriculum-nodes/:nodeId/deactivate | SuperAdmin | Deactivate node + descendants |
| GET | /platform-subjects | OrgAdmin/Teacher | List platform subjects |
| POST | /platform-subjects | SuperAdmin | Create platform subject |
| POST | /platform-subjects/:id/curriculum-mapping | SuperAdmin | Map subject to curriculum node |
| GET | /students/:studentId/curriculum | Teacher/Parent | Resolve student curriculum |
