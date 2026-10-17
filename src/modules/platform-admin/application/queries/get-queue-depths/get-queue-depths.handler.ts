import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQueueDepthsQuery } from './get-queue-depths.query';
import { IPlatformMonitoringPort } from '../../../domain';

export interface QueueDepthDto {
  queue: string;
  waiting: number;
  active: number;
  failed: number;
}

@QueryHandler(GetQueueDepthsQuery)
export class GetQueueDepthsHandler
  implements IQueryHandler<GetQueueDepthsQuery, QueueDepthDto[]>
{
  constructor(
    private readonly monitoringPort: IPlatformMonitoringPort,
  ) {}

  async execute(_query: GetQueueDepthsQuery): Promise<QueueDepthDto[]> {
    return this.monitoringPort.getQueueDepths();
  }
}
