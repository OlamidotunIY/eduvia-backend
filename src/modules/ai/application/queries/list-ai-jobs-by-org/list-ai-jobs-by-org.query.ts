import { AiJobType, AiJobStatus } from '../../../domain';

export class ListAiJobsByOrgQuery {
  constructor(
    public readonly orgId: string,
    public readonly options?: {
      type?: AiJobType;
      status?: AiJobStatus;
      limit?: number;
      offset?: number;
    },
  ) {}
}
