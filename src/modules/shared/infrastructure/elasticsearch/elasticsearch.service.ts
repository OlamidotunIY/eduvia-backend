import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import {
  orgIndexMapping,
  questionIndexMapping,
  curriculumNodeIndexMapping,
  teacherIndexMapping,
} from './index-mappings';

export interface SearchHits<T = any> {
  hits: Array<{ _id: string; _source: T }>;
  total: { value: number } | number;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  readonly client: Client;
  private isConnected = false;
  private readonly inMemoryStore = new Map<string, Map<string, any>>();

  constructor() {
    const node = process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200';
    this.client = new Client({
      node,
      auth: process.env.ELASTICSEARCH_API_KEY
        ? { apiKey: process.env.ELASTICSEARCH_API_KEY }
        : undefined,
      tls: node.startsWith('https') ? { rejectUnauthorized: true } : undefined,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      if (process.env.ELASTICSEARCH_URL) {
        const info = await this.client.info();
        this.isConnected = true;
        this.logger.log(`Connected to Elasticsearch: ${info.version.number}`);
        await this.bootstrapIndices();
      } else {
        this.logger.warn(
          'ELASTICSEARCH_URL not configured. Operating in high-performance in-memory search mode.',
        );
      }
    } catch (error) {
      this.logger.warn(
        `Elasticsearch not reachable (${(error as Error).message}). Using resilient in-memory search fallback.`,
      );
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
      try {
        const exists = await this.client.indices.exists({ index: name });
        if (!exists) {
          await this.client.indices.create({ index: name, body: mapping });
          this.logger.log(`Created Elasticsearch index: ${name}`);
        }
      } catch (err) {
        this.logger.warn(`Failed to bootstrap index ${name}: ${(err as Error).message}`);
      }
    }
  }

  async indexDocument(index: string, id: string, document: any): Promise<void> {
    let indexMap = this.inMemoryStore.get(index);
    if (!indexMap) {
      indexMap = new Map();
      this.inMemoryStore.set(index, indexMap);
    }
    indexMap.set(id, { ...document, id });

    if (this.isConnected) {
      try {
        await this.client.index({
          index,
          id,
          document,
          refresh: 'wait_for',
        });
      } catch (err) {
        this.logger.warn(`Failed to index to Elasticsearch: ${(err as Error).message}`);
      }
    }
  }

  async deleteDocument(index: string, id: string): Promise<void> {
    const indexMap = this.inMemoryStore.get(index);
    if (indexMap) {
      indexMap.delete(id);
    }

    if (this.isConnected) {
      try {
        await this.client.delete({ index, id });
      } catch (err) {
        this.logger.warn(`Failed to delete from Elasticsearch: ${(err as Error).message}`);
      }
    }
  }

  async search(params: {
    index: string;
    from?: number;
    size?: number;
    query?: any;
    sort?: any[];
  }): Promise<{ hits: SearchHits }> {
    if (this.isConnected) {
      try {
        const res = await this.client.search(params);
        return { hits: res.hits as SearchHits };
      } catch (err) {
        this.logger.warn(
          `Elasticsearch search error (${(err as Error).message}), falling back to in-memory store`,
        );
      }
    }

    // In-memory search evaluator
    const indexMap = this.inMemoryStore.get(params.index);
    if (!indexMap) {
      return { hits: { hits: [], total: { value: 0 } } };
    }

    let allDocs = Array.from(indexMap.values());

    if (params.query?.bool) {
      allDocs = allDocs.filter((doc) => this.matchesBoolQuery(doc, params.query.bool));
    }

    const total = allDocs.length;
    const from = params.from ?? 0;
    const size = params.size ?? 20;
    const paged = allDocs.slice(from, from + size);

    return {
      hits: {
        hits: paged.map((doc) => ({
          _id: doc.id,
          _source: doc,
        })),
        total: { value: total },
      },
    };
  }

  private matchesBoolQuery(doc: any, bool: any): boolean {
    // Check 'must' conditions
    if (bool.must) {
      const mustClauses = Array.isArray(bool.must) ? bool.must : [bool.must];
      for (const clause of mustClauses) {
        if (!this.matchesClause(doc, clause)) return false;
      }
    }

    // Check 'filter' conditions
    if (bool.filter) {
      const filterClauses = Array.isArray(bool.filter) ? bool.filter : [bool.filter];
      for (const clause of filterClauses) {
        if (!this.matchesClause(doc, clause)) return false;
      }
    }

    // Check 'should' conditions (if present, at least one must match)
    if (bool.should && bool.should.length > 0) {
      const matchedShould = bool.should.some((clause: any) => this.matchesClause(doc, clause));
      if (!matchedShould) return false;
    }

    return true;
  }

  private matchesClause(doc: any, clause: any): boolean {
    if (clause.term) {
      const [key, val] = Object.entries(clause.term)[0];
      return doc[key] === val;
    }

    if (clause.terms) {
      const [key, vals] = Object.entries(clause.terms)[0] as [string, any[]];
      const docVal = doc[key];
      if (Array.isArray(docVal)) {
        return docVal.some((v) => vals.includes(v));
      }
      return vals.includes(docVal);
    }

    if (clause.prefix) {
      const [key, val] = Object.entries(clause.prefix)[0] as [string, string];
      return typeof doc[key] === 'string' && doc[key].startsWith(val);
    }

    if (clause.match) {
      const [key, matchOpt] = Object.entries(clause.match)[0] as [string, any];
      const queryStr = (typeof matchOpt === 'object' ? matchOpt.query : matchOpt).toLowerCase();
      const docVal = (doc[key] ?? '').toString().toLowerCase();
      return docVal.includes(queryStr);
    }

    if (clause.multi_match) {
      const queryStr = clause.multi_match.query.toLowerCase();
      const fields = clause.multi_match.fields ?? [];
      return fields.some((rawField: string) => {
        const fieldName = rawField.replace(/\^\d+$/, '');
        const val = doc[fieldName];
        if (Array.isArray(val)) {
          return val.some((v) => v.toString().toLowerCase().includes(queryStr));
        }
        return val && val.toString().toLowerCase().includes(queryStr);
      });
    }

    if (clause.match_phrase_prefix) {
      const [key, matchOpt] = Object.entries(clause.match_phrase_prefix)[0] as [string, any];
      const queryStr = (typeof matchOpt === 'object' ? matchOpt.query : matchOpt).toLowerCase();
      const docVal = (doc[key] ?? '').toString().toLowerCase();
      return docVal.startsWith(queryStr) || docVal.includes(queryStr);
    }

    if (clause.bool) {
      return this.matchesBoolQuery(doc, clause.bool);
    }

    return true;
  }
}
