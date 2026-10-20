import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ResolveStudentCurriculumQuery } from './resolve-student-curriculum.query';
import { ResolvedStudentCurriculumDto } from './resolve-student-curriculum.dto';
import {
  CurriculumProfileNotFoundError,
  ICurriculumProfileRepository,
} from '../../../domain';

@QueryHandler(ResolveStudentCurriculumQuery)
export class ResolveStudentCurriculumHandler
  implements IQueryHandler<ResolveStudentCurriculumQuery, ResolvedStudentCurriculumDto>
{
  constructor(private readonly profileRepository: ICurriculumProfileRepository) {}

  async execute(query: ResolveStudentCurriculumQuery): Promise<ResolvedStudentCurriculumDto> {
    const profiles = await this.profileRepository.findByCountryCode(query.countryCode);
    const active = profiles.find((p) => p.isActive);
    if (!active) {
      throw new CurriculumProfileNotFoundError(`country:${query.countryCode}`);
    }

    return {
      curriculum: {
        id: active.id.unpack(),
        name: active.name,
        shortCode: active.shortCode,
        countryCode: active.countryCode,
        description: active.description,
        authority: active.authority,
        version: active.version,
      },
    };
  }
}
