import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPlatformHealthQuery } from './get-platform-health.query';
import { IPlatformMonitoringPort, PlatformHealthMetricDto } from '../../../domain';

@QueryHandler(GetPlatformHealthQuery)
export class GetPlatformHealthHandler
  implements IQueryHandler<GetPlatformHealthQuery, PlatformHealthMetricDto>
{
  constructor(
    private readonly monitoringPort: IPlatformMonitoringPort,
  ) {}

  async execute(_query: GetPlatformHealthQuery): Promise<PlatformHealthMetricDto> {
    return this.monitoringPort.getHealthMetrics();
  }
}
