import { AiJobType } from '../../../domain';

export class ListPromptTemplatesQuery {
  constructor(
    public readonly filter?: {
      type?: AiJobType;
      isActive?: boolean;
    },
  ) {}
}
