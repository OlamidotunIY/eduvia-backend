# Setup Guide — Elasticsearch (Full-Text Search)

> Full setup for Elasticsearch 8.x in Eduvia using the official `@elastic/elasticsearch` client with NestJS.

---

## Architecture Decision

Elasticsearch powers all search and discovery in Eduvia:
- **Org marketplace search** — parents discover orgs by subject, country, name
- **Teacher search** — admins find teachers by subject, status, name
- **Student search** — within an org
- **Question bank search** — filter by type, difficulty, curriculum node, subject
- **Curriculum node search** — teachers browse and tag lessons to curriculum nodes
- **Lesson history search** — full-text search on lesson reports

**Write pattern:** All Elasticsearch writes are async — triggered by domain events via the `search-events` BullMQ queue. The Prisma PostgreSQL DB is always the source of truth. Elasticsearch is a derived read model.

---

## 1. Install Dependencies

```bash
pnpm add @elastic/elasticsearch
```

---

## 2. Elasticsearch Module

```typescript
// src/modules/shared/infrastructure/elasticsearch/elasticsearch.module.ts

import { Module, Global } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';

@Global()
@Module({
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
```

```typescript
// src/modules/shared/infrastructure/elasticsearch/elasticsearch.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  readonly client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
      auth: process.env.ELASTICSEARCH_API_KEY
        ? { apiKey: process.env.ELASTICSEARCH_API_KEY }
        : undefined,
      tls: process.env.ELASTICSEARCH_URL?.startsWith('https')
        ? { rejectUnauthorized: true }
        : undefined,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      const info = await this.client.info();
      this.logger.log(`Connected to Elasticsearch: ${info.version.number}`);
      await this.bootstrapIndices();
    } catch (error) {
      this.logger.error('Failed to connect to Elasticsearch', error);
    }
  }

  private async bootstrapIndices(): Promise<void> {
    const indices = [
      { name: 'eduvia_orgs', mapping: orgIndexMapping },
      { name: 'eduvia_questions', mapping: questionIndexMapping },
      { name: 'eduvia_curriculum_nodes', mapping: curriculumNodeIndexMapping },
      { name: 'eduvia_teachers', mapping: teacherIndexMapping },
    ];

    for (const { name, mapping } of indices) {
      const exists = await this.client.indices.exists({ index: name });
      if (!exists) {
        await this.client.indices.create({ index: name, body: mapping });
        this.logger.log(`Created Elasticsearch index: ${name}`);
      }
    }
  }
}
```

---

## 3. Index Mappings

```typescript
// src/modules/shared/infrastructure/elasticsearch/index-mappings.ts

export const orgIndexMapping = {
  settings: {
    analysis: {
      analyzer: {
        edu_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'edu_synonyms'],
        },
      },
      filter: {
        edu_synonyms: {
          type: 'synonym',
          synonyms: ['maths,mathematics', 'english,english language'],
        },
      },
    },
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      name: {
        type: 'text',
        analyzer: 'edu_analyzer',
        fields: { keyword: { type: 'keyword' } },
      },
      slug: { type: 'keyword' },
      description: { type: 'text', analyzer: 'edu_analyzer' },
      country: { type: 'keyword' },
      subjects: { type: 'keyword' },   // array of subject names
      status: { type: 'keyword' },
      marketplaceListed: { type: 'boolean' },
      acceptingTeachers: { type: 'boolean' },
      timezone: { type: 'keyword' },
      createdAt: { type: 'date' },
    },
  },
};

export const questionIndexMapping = {
  mappings: {
    properties: {
      id: { type: 'keyword' },
      stem: { type: 'text', analyzer: 'standard' },
      type: { type: 'keyword' },
      ownerType: { type: 'keyword' },
      orgId: { type: 'keyword' },
      subject: { type: 'keyword' },
      curriculumNodeId: { type: 'keyword' },
      curriculumNodePath: { type: 'keyword' },
      difficultyLevel: { type: 'integer' },
      tags: { type: 'keyword' },
      examBoard: { type: 'keyword' },
      yearGroup: { type: 'keyword' },
      isPublished: { type: 'boolean' },
      usageCount: { type: 'integer' },
      avgScore: { type: 'float' },
      correctRate: { type: 'float' },
      createdAt: { type: 'date' },
    },
  },
};

export const curriculumNodeIndexMapping = {
  mappings: {
    properties: {
      id: { type: 'keyword' },
      curriculumId: { type: 'keyword' },
      name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      code: { type: 'keyword' },
      description: { type: 'text' },
      nodeType: { type: 'keyword' },
      gradeLevel: { type: 'keyword' },
      depth: { type: 'integer' },
      path: { type: 'keyword' },
      isLeaf: { type: 'boolean' },
      isActive: { type: 'boolean' },
    },
  },
};

export const teacherIndexMapping = {
  mappings: {
    properties: {
      userId: { type: 'keyword' },
      orgId: { type: 'keyword' },
      membershipId: { type: 'keyword' },
      firstName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      lastName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
      email: { type: 'keyword' },
      subjects: { type: 'keyword' },
      role: { type: 'keyword' },
      status: { type: 'keyword' },
      joinedAt: { type: 'date' },
    },
  },
};
```

---

## 4. Search Index Service (Per Domain)

```typescript
// src/modules/org/infrastructure/search/org-search.service.ts

import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@modules/shared';

export interface OrgSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  country: string;
  subjects: string[];
}

export interface OrgSearchParams {
  query?: string;
  country?: string;
  subjects?: string[];
  acceptingTeachers?: boolean;
  page?: number;
  size?: number;
}

@Injectable()
export class OrgSearchService {
  private readonly INDEX = 'eduvia_orgs';

  constructor(private readonly es: ElasticsearchService) {}

  async indexOrg(org: OrgSearchResult & { marketplaceListed: boolean; status: string }): Promise<void> {
    await this.es.client.index({
      index: this.INDEX,
      id: org.id,
      document: org,
      refresh: 'wait_for',  // ensure searchable immediately (only on writes — remove in hot path)
    });
  }

  async removeOrg(orgId: string): Promise<void> {
    await this.es.client.delete({ index: this.INDEX, id: orgId });
  }

  async searchMarketplace(params: OrgSearchParams): Promise<{
    results: OrgSearchResult[];
    total: number;
  }> {
    const { query, country, subjects, acceptingTeachers, page = 1, size = 20 } = params;

    const must: object[] = [
      { term: { status: 'active' } },
      { term: { marketplaceListed: true } },
    ];

    const filter: object[] = [];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['name^3', 'description', 'subjects^2'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    if (country) filter.push({ term: { country } });
    if (subjects?.length) filter.push({ terms: { subjects } });
    if (acceptingTeachers !== undefined) {
      filter.push({ term: { acceptingTeachers } });
    }

    const response = await this.es.client.search({
      index: this.INDEX,
      from: (page - 1) * size,
      size,
      query: { bool: { must, filter } },
      sort: [{ _score: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      results: response.hits.hits.map((hit) => hit._source as OrgSearchResult),
      total: typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total?.value ?? 0,
    };
  }
}
```

---

## 5. BullMQ Search Worker (Consuming search-events)

```typescript
// src/modules/shared/infrastructure/search/search.worker.ts

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OrgSearchService } from '@modules/org';
import { QuestionSearchService } from '@modules/assessment';
import { CurriculumNodeSearchService } from '@modules/curriculum';

@Processor('search-events')
export class SearchWorker extends WorkerHost {
  private readonly logger = new Logger(SearchWorker.name);

  constructor(
    private readonly orgSearch: OrgSearchService,
    private readonly questionSearch: QuestionSearchService,
    private readonly curriculumSearch: CurriculumNodeSearchService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.debug(`Processing search event: ${job.name}`);

    switch (job.name) {
      case 'OrgCreatedEvent':
      case 'OrgUpdatedEvent':
      case 'OrgListedOnMarketplaceEvent':
        await this.orgSearch.indexOrg(job.data.payload);
        break;

      case 'OrgSuspendedEvent':
        await this.orgSearch.removeOrg(job.data.payload.orgId);
        break;

      case 'QuestionCreatedEvent':
      case 'QuestionPublishedEvent':
        await this.questionSearch.indexQuestion(job.data.payload);
        break;

      case 'CurriculumNodeCreatedEvent':
      case 'CurriculumNodeUpdatedEvent':
        await this.curriculumSearch.indexNode(job.data.payload);
        break;

      case 'CurriculumNodeDeactivatedEvent':
        await this.curriculumSearch.removeNode(job.data.payload.nodeId);
        break;

      default:
        this.logger.warn(`Unknown search event: ${job.name}`);
    }
  }
}
```

---

## 6. Question Bank Search

```typescript
// src/modules/assessment/infrastructure/search/question-search.service.ts

import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@modules/shared';

export interface QuestionSearchParams {
  query?: string;
  type?: string;
  ownerType?: 'platform' | 'org' | 'teacher';
  orgId?: string;
  teacherId?: string;
  subject?: string;
  curriculumNodeId?: string;
  difficultyLevel?: number;
  examBoard?: string;
  yearGroup?: string;
  tags?: string[];
  isPublished?: boolean;
  page?: number;
  size?: number;
}

@Injectable()
export class QuestionSearchService {
  private readonly INDEX = 'eduvia_questions';

  constructor(private readonly es: ElasticsearchService) {}

  async searchQuestions(params: QuestionSearchParams, requestingTeacherId: string, requestingOrgId: string) {
    const must: object[] = [];
    const filter: object[] = [];
    const should: object[] = [];

    // Visibility filter: platform + org + this teacher's own questions
    filter.push({
      bool: {
        should: [
          { term: { ownerType: 'platform' } },
          { bool: { must: [{ term: { ownerType: 'org' } }, { term: { orgId: requestingOrgId } }] } },
          { bool: { must: [
            { term: { ownerType: 'teacher' } },
            { term: { orgId: requestingOrgId } },
            // NOTE: teacher questions from other teachers in same org are NOT visible
            // unless shared — add a `isShared` flag in Phase 2
          ]}},
        ],
      },
    });

    if (params.query) {
      must.push({ match: { stem: { query: params.query, fuzziness: 'AUTO' } } });
    }

    if (params.type) filter.push({ term: { type: params.type } });
    if (params.subject) filter.push({ term: { subject: params.subject } });
    if (params.curriculumNodeId) {
      // Search within a curriculum subtree using the materialized path
      filter.push({ prefix: { curriculumNodePath: params.curriculumNodeId } });
    }
    if (params.difficultyLevel) filter.push({ term: { difficultyLevel: params.difficultyLevel } });
    if (params.examBoard) filter.push({ term: { examBoard: params.examBoard } });
    if (params.yearGroup) filter.push({ term: { yearGroup: params.yearGroup } });
    if (params.tags?.length) filter.push({ terms: { tags: params.tags } });
    if (params.isPublished !== undefined) filter.push({ term: { isPublished: params.isPublished } });

    const { page = 1, size = 20 } = params;

    const response = await this.es.client.search({
      index: this.INDEX,
      from: (page - 1) * size,
      size,
      query: { bool: { must, filter, should } },
      sort: [{ _score: 'desc' }, { usageCount: 'desc' }],
    });

    return {
      results: response.hits.hits.map((h) => h._source),
      total: typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total?.value ?? 0,
    };
  }
}
```

---

## 7. Register search-events Queue

```typescript
// Add to outbox-event-routes.ts:
['OrgCreatedEvent',              'search-events'],
['OrgUpdatedEvent',              'search-events'],
['OrgListedOnMarketplaceEvent',  'search-events'],
['OrgSuspendedEvent',            'search-events'],
['QuestionCreatedEvent',         'search-events'],
['QuestionPublishedEvent',       'search-events'],
['CurriculumNodeCreatedEvent',   'search-events'],
['CurriculumNodeUpdatedEvent',   'search-events'],
['CurriculumNodeDeactivatedEvent','search-events'],

// Register the queue in shared BullMQ config:
BullModule.registerQueue({ name: 'search-events' })
```

---

## 8. Curriculum Node Search (Autocomplete for Teachers)

```typescript
// Autocomplete when teacher is tagging a lesson plan topic
async suggestNodes(prefix: string, curriculumId?: string) {
  const filter: object[] = [
    { term: { isActive: true } },
    { term: { isLeaf: true } },  // only suggest leaf nodes for tagging
  ];
  if (curriculumId) filter.push({ term: { curriculumId } });

  const response = await this.es.client.search({
    index: 'eduvia_curriculum_nodes',
    size: 10,
    query: {
      bool: {
        must: [
          { match_phrase_prefix: { name: { query: prefix, max_expansions: 20 } } },
        ],
        filter,
      },
    },
    _source: ['id', 'name', 'code', 'gradeLevel', 'path'],
  });

  return response.hits.hits.map((h) => h._source);
}
```

---

## 9. Environment Variables

```env
ELASTICSEARCH_URL=http://localhost:9200
# For Elastic Cloud / production:
ELASTICSEARCH_URL=https://your-cluster.es.io:9243
ELASTICSEARCH_API_KEY=base64encodedapikey==
```

---

## 10. Local Development with Docker

```yaml
# docker-compose.yml (dev only)
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.13.4
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false   # dev only
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.13.4
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200

volumes:
  esdata:
```
