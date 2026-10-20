import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ElasticsearchService } from './elasticsearch.service';
import { OrgSearchService } from './services/org-search.service';
import { QuestionSearchService } from './services/question-search.service';
import { CurriculumNodeSearchService } from './services/curriculum-node-search.service';
import { SearchWorker } from './search.worker';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'search-events',
    }),
  ],
  providers: [
    ElasticsearchService,
    OrgSearchService,
    QuestionSearchService,
    CurriculumNodeSearchService,
    SearchWorker,
  ],
  exports: [
    ElasticsearchService,
    OrgSearchService,
    QuestionSearchService,
    CurriculumNodeSearchService,
    SearchWorker,
  ],
})
export class ElasticsearchModule {}
