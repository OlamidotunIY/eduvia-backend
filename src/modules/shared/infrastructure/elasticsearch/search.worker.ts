import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OrgSearchService } from './services/org-search.service';
import { QuestionSearchService } from './services/question-search.service';
import { CurriculumNodeSearchService } from './services/curriculum-node-search.service';

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
        this.logger.debug(`Handled search event: ${job.name}`);
        break;
    }
  }
}
