import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  CurriculumNodeId,
  ICurriculumNodeRepository,
} from '../../../domain';
import { DeactivateCurriculumNodeCommand } from '../../../application/commands';

@Processor('search-events')
@Injectable()
export class CurriculumCascadeDeactivateProcessor extends WorkerHost {
  private readonly logger = new Logger(CurriculumCascadeDeactivateProcessor.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly nodeRepository: ICurriculumNodeRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === 'CurriculumNodeDeactivatedEvent') {
      const { nodeId } = job.data.payload ?? {};
      if (!nodeId) return;

      this.logger.log(`Processing cascade deactivation for node ${nodeId}`);

      const children = await this.nodeRepository.findByParentId(CurriculumNodeId.from(nodeId));
      for (const child of children) {
        if (child.isActive) {
          await this.commandBus.execute(
            new DeactivateCurriculumNodeCommand({
              id: child.id.unpack(),
              correlationId: job.data.correlationId,
            }),
          );
        }
      }
    }
  }
}
