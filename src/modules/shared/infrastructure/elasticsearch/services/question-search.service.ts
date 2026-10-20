import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch.service';

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

  async indexQuestion(question: any): Promise<void> {
    await this.es.indexDocument(this.INDEX, question.id, question);
  }

  async removeQuestion(questionId: string): Promise<void> {
    await this.es.deleteDocument(this.INDEX, questionId);
  }

  async searchQuestions(
    params: QuestionSearchParams,
    _requestingTeacherId?: string,
    requestingOrgId?: string,
  ): Promise<{ results: any[]; total: number }> {
    const must: object[] = [];
    const filter: object[] = [];

    if (requestingOrgId) {
      filter.push({
        bool: {
          should: [
            { term: { ownerType: 'platform' } },
            {
              bool: {
                must: [
                  { term: { ownerType: 'org' } },
                  { term: { orgId: requestingOrgId } },
                ],
              },
            },
          ],
        },
      });
    }

    if (params.query) {
      must.push({ match: { stem: params.query } });
    }

    if (params.type) filter.push({ term: { type: params.type } });
    if (params.subject) filter.push({ term: { subject: params.subject } });
    if (params.curriculumNodeId) {
      filter.push({ prefix: { curriculumNodePath: params.curriculumNodeId } });
    }
    if (params.difficultyLevel) {
      filter.push({ term: { difficultyLevel: params.difficultyLevel } });
    }
    if (params.examBoard) filter.push({ term: { examBoard: params.examBoard } });
    if (params.yearGroup) filter.push({ term: { yearGroup: params.yearGroup } });
    if (params.tags?.length) filter.push({ terms: { tags: params.tags } });
    if (params.isPublished !== undefined) {
      filter.push({ term: { isPublished: params.isPublished } });
    }

    const { page = 1, size = 20 } = params;

    const response = await this.es.search({
      index: this.INDEX,
      from: (page - 1) * size,
      size,
      query: { bool: { must, filter } },
    });

    const totalVal =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total?.value ?? 0;

    return {
      results: response.hits.hits.map((h) => h._source),
      total: totalVal,
    };
  }
}
