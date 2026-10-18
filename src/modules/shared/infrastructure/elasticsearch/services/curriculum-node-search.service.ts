import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch.service';

export interface CurriculumNodeSearchResult {
  id: string;
  name: string;
  code: string;
  gradeLevel: string;
  path: string;
  curriculumId?: string;
  isLeaf?: boolean;
  isActive?: boolean;
}

@Injectable()
export class CurriculumNodeSearchService {
  private readonly INDEX = 'eduvia_curriculum_nodes';

  constructor(private readonly es: ElasticsearchService) {}

  async indexNode(node: CurriculumNodeSearchResult): Promise<void> {
    await this.es.indexDocument(this.INDEX, node.id, node);
  }

  async removeNode(nodeId: string): Promise<void> {
    await this.es.deleteDocument(this.INDEX, nodeId);
  }

  async suggestNodes(
    prefix: string,
    curriculumId?: string,
  ): Promise<CurriculumNodeSearchResult[]> {
    const filter: object[] = [
      { term: { isActive: true } },
    ];
    if (curriculumId) {
      filter.push({ term: { curriculumId } });
    }

    const response = await this.es.search({
      index: this.INDEX,
      size: 10,
      query: {
        bool: {
          must: [
            { match_phrase_prefix: { name: prefix } },
          ],
          filter,
        },
      },
    });

    return response.hits.hits.map(
      (h) => h._source as CurriculumNodeSearchResult,
    );
  }
}
