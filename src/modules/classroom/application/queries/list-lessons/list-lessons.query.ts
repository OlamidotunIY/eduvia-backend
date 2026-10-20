import { LessonFilters } from '../../../domain';

export class ListLessonsQuery {
  constructor(
    public readonly orgId: string,
    public readonly filters?: LessonFilters,
  ) {}
}
