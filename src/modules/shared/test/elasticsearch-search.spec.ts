import { ElasticsearchService } from '../infrastructure/elasticsearch/elasticsearch.service';
import { OrgSearchService } from '../infrastructure/elasticsearch/services/org-search.service';
import { QuestionSearchService } from '../infrastructure/elasticsearch/services/question-search.service';
import { CurriculumNodeSearchService } from '../infrastructure/elasticsearch/services/curriculum-node-search.service';
import { SearchWorker } from '../infrastructure/elasticsearch/search.worker';

describe('Elasticsearch & Domain Search Integration (Phase 5)', () => {
  let esService: ElasticsearchService;
  let orgSearch: OrgSearchService;
  let questionSearch: QuestionSearchService;
  let curriculumSearch: CurriculumNodeSearchService;
  let searchWorker: SearchWorker;

  beforeEach(async () => {
    esService = new ElasticsearchService();
    await esService.onModuleInit();
    orgSearch = new OrgSearchService(esService);
    questionSearch = new QuestionSearchService(esService);
    curriculumSearch = new CurriculumNodeSearchService(esService);
    searchWorker = new SearchWorker(orgSearch, questionSearch, curriculumSearch);
  });

  describe('ElasticsearchService In-Memory Fallback', () => {
    it('indexes, retrieves, and deletes documents', async () => {
      await esService.indexDocument('test_index', 'doc-1', {
        title: 'Mathematics Fundamentals',
        category: 'maths',
      });

      const res = await esService.search({
        index: 'test_index',
        query: {
          bool: {
            must: [{ match: { title: 'mathematics' } }],
          },
        },
      });

      expect(res.hits.hits.length).toBe(1);
      expect(res.hits.hits[0]._source.title).toBe('Mathematics Fundamentals');

      await esService.deleteDocument('test_index', 'doc-1');
      const resAfterDelete = await esService.search({ index: 'test_index' });
      expect(resAfterDelete.hits.hits.length).toBe(0);
    });
  });

  describe('OrgSearchService', () => {
    it('indexes organizations and performs marketplace search', async () => {
      await orgSearch.indexOrg({
        id: 'org-1',
        name: 'Apex Academy London',
        slug: 'apex-london',
        description: 'Specialist GCSE Maths and Physics tuition',
        country: 'GB',
        subjects: ['Mathematics', 'Physics'],
        status: 'active',
        marketplaceListed: true,
        acceptingTeachers: true,
      });

      await orgSearch.indexOrg({
        id: 'org-2',
        name: 'Bright Minds Manchester',
        slug: 'bright-minds',
        description: 'Primary and secondary English coaching',
        country: 'GB',
        subjects: ['English'],
        status: 'active',
        marketplaceListed: true,
        acceptingTeachers: false,
      });

      // Search by query
      const searchMaths = await orgSearch.searchMarketplace({
        query: 'maths',
        country: 'GB',
      });
      expect(searchMaths.results.length).toBe(1);
      expect(searchMaths.results[0].id).toBe('org-1');

      // Search by subject filter
      const searchEnglish = await orgSearch.searchMarketplace({
        subjects: ['English'],
      });
      expect(searchEnglish.results.length).toBe(1);
      expect(searchEnglish.results[0].id).toBe('org-2');
    });
  });

  describe('QuestionSearchService', () => {
    it('indexes questions and queries question bank by type and difficulty', async () => {
      await questionSearch.indexQuestion({
        id: 'q-101',
        stem: 'Calculate the area of a circle with radius 5cm',
        type: 'short_answer',
        ownerType: 'platform',
        subject: 'Mathematics',
        difficultyLevel: 3,
        isPublished: true,
      });

      await questionSearch.indexQuestion({
        id: 'q-102',
        stem: 'Explain the process of photosynthesis in plants',
        type: 'long_answer',
        ownerType: 'platform',
        subject: 'Biology',
        difficultyLevel: 4,
        isPublished: true,
      });

      const mathResults = await questionSearch.searchQuestions({
        subject: 'Mathematics',
        difficultyLevel: 3,
      });

      expect(mathResults.results.length).toBe(1);
      expect(mathResults.results[0].id).toBe('q-101');

      const textResults = await questionSearch.searchQuestions({
        query: 'photosynthesis',
      });

      expect(textResults.results.length).toBe(1);
      expect(textResults.results[0].id).toBe('q-102');
    });
  });

  describe('CurriculumNodeSearchService', () => {
    it('suggests curriculum nodes by prefix autocomplete', async () => {
      await curriculumSearch.indexNode({
        id: 'node-algebra',
        name: 'Quadratic Equations and Functions',
        code: 'MATH-ALG-04',
        gradeLevel: 'Year 11',
        path: '/maths/algebra/quadratics',
        isActive: true,
      });

      await curriculumSearch.indexNode({
        id: 'node-trig',
        name: 'Trigonometric Ratios in Right Triangles',
        code: 'MATH-GEOM-02',
        gradeLevel: 'Year 10',
        path: '/maths/geometry/trig',
        isActive: true,
      });

      const suggestions = await curriculumSearch.suggestNodes('quad');
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].id).toBe('node-algebra');
    });
  });

  describe('SearchWorker Event Consumer', () => {
    it('consumes domain events and updates search indexes', async () => {
      await searchWorker.process({
        name: 'OrgCreatedEvent',
        data: {
          payload: {
            id: 'org-event-1',
            name: 'Starlight Tutors',
            slug: 'starlight',
            description: 'Top STEM tutoring',
            country: 'GB',
            subjects: ['Science', 'Mathematics'],
            status: 'active',
            marketplaceListed: true,
          },
        },
      } as any);

      const res = await orgSearch.searchMarketplace({ query: 'starlight' });
      expect(res.results.length).toBe(1);
      expect(res.results[0].name).toBe('Starlight Tutors');

      await searchWorker.process({
        name: 'OrgSuspendedEvent',
        data: {
          payload: { orgId: 'org-event-1' },
        },
      } as any);

      const resAfterSuspend = await orgSearch.searchMarketplace({ query: 'starlight' });
      expect(resAfterSuspend.results.length).toBe(0);
    });
  });
});
