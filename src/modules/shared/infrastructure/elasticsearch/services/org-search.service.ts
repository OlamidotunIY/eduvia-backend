import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch.service';

export interface OrgSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  country: string;
  subjects: string[];
  status?: string;
  marketplaceListed?: boolean;
  acceptingTeachers?: boolean;
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

  async indexOrg(
    org: OrgSearchResult & { marketplaceListed?: boolean; status?: string },
  ): Promise<void> {
    await this.es.indexDocument(this.INDEX, org.id, org);
  }

  async removeOrg(orgId: string): Promise<void> {
    await this.es.deleteDocument(this.INDEX, orgId);
  }

  async searchMarketplace(params: OrgSearchParams): Promise<{
    results: OrgSearchResult[];
    total: number;
  }> {
    const {
      query,
      country,
      subjects,
      acceptingTeachers,
      page = 1,
      size = 20,
    } = params;

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
        },
      });
    }

    if (country) filter.push({ term: { country } });
    if (subjects?.length) filter.push({ terms: { subjects } });
    if (acceptingTeachers !== undefined) {
      filter.push({ term: { acceptingTeachers } });
    }

    const response = await this.es.search({
      index: this.INDEX,
      from: (page - 1) * size,
      size,
      query: { bool: { must, filter } },
      sort: [{ createdAt: 'desc' }],
    });

    const totalVal =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total?.value ?? 0;

    return {
      results: response.hits.hits.map((hit) => hit._source as OrgSearchResult),
      total: totalVal,
    };
  }
}
