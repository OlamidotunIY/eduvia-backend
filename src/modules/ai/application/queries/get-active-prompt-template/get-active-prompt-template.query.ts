import { AiJobType } from '../../../domain';

export class GetActivePromptTemplateQuery {
  constructor(public readonly type: AiJobType) {}
}
