import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPlatformSubjectsQuery } from './list-platform-subjects.query';
import { PlatformSubjectDto } from './list-platform-subjects.dto';
import { IPlatformSubjectRepository } from '../../../domain';

@QueryHandler(ListPlatformSubjectsQuery)
export class ListPlatformSubjectsHandler
  implements IQueryHandler<ListPlatformSubjectsQuery, PlatformSubjectDto[]>
{
  constructor(private readonly subjectRepository: IPlatformSubjectRepository) {}

  async execute(query: ListPlatformSubjectsQuery): Promise<PlatformSubjectDto[]> {
    const subjects = query.activeOnly
      ? await this.subjectRepository.findActive()
      : await this.subjectRepository.findAll();

    return subjects.map((s) => ({
      id: s.id.unpack(),
      name: s.name,
      shortCode: s.shortCode,
      description: s.description,
      isActive: s.isActive,
      createdAt: s.createdAt,
    }));
  }
}
