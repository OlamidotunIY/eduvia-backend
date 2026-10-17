import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListCurriculaQuery } from './list-curricula.query';
import { CurriculumSummaryDto } from './list-curricula.dto';
import { CurriculumProfile, ICurriculumProfileRepository } from '../../../domain';

@QueryHandler(ListCurriculaQuery)
export class ListCurriculaHandler
  implements IQueryHandler<ListCurriculaQuery, CurriculumSummaryDto[]>
{
  constructor(private readonly profileRepository: ICurriculumProfileRepository) {}

  async execute(query: ListCurriculaQuery): Promise<CurriculumSummaryDto[]> {
    let profiles: CurriculumProfile[];
    if (query.filter?.countryCode) {
      profiles = await this.profileRepository.findByCountryCode(query.filter.countryCode);
      if (query.filter.isActive !== undefined) {
        profiles = profiles.filter((p) => p.isActive === query.filter!.isActive);
      }
    } else if (query.filter?.isActive) {
      profiles = await this.profileRepository.findActive();
    } else {
      profiles = await this.profileRepository.findAll();
    }

    return profiles.map((p) => ({
      id: p.id.unpack(),
      name: p.name,
      shortCode: p.shortCode,
      countryCode: p.countryCode,
      description: p.description,
      authority: p.authority,
      isActive: p.isActive,
      version: p.version,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }
}
