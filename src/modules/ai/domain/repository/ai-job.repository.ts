import { BaseRepository } from '@modules/shared/domain';
import { AiJobId, AiJobType, AiJobStatus } from '../value-objects';
import { AiJob } from '../model/AiJob';

export interface FindAiJobsByOrgOptions {
  type?: AiJobType;
  status?: AiJobStatus;
  limit?: number;
  offset?: number;
}

export interface AiCostSummary {
  orgId: string;
  totalTokens: number;
  totalJobs: number;
}

export abstract class IAiJobRepository extends BaseRepository<AiJob, AiJobId> {
  public abstract findActiveJob(
    type: AiJobType,
    relatedEntityId: string,
  ): Promise<AiJob | null>;

  public abstract findByOrg(
    orgId: string,
    options?: FindAiJobsByOrgOptions,
  ): Promise<AiJob[]>;

  public abstract countByOrg(
    orgId: string,
    options?: { type?: AiJobType; status?: AiJobStatus },
  ): Promise<number>;

  public abstract getCostSummaryByOrg(): Promise<AiCostSummary[]>;

  public abstract findLatestCompleted(
    type: AiJobType,
    relatedEntityId: string,
  ): Promise<AiJob | null>;
}
