import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCurriculumByIdQuery } from './get-curriculum-by-id.query';
import { CurriculumProfileDetailDto } from './get-curriculum-by-id.dto';
import {
  CurriculumProfileId,
  CurriculumProfileNotFoundError,
  ICurriculumProfileRepository,
} from '../../../domain';

@QueryHandler(GetCurriculumByIdQuery)
export class GetCurriculumByIdHandler
  implements IQueryHandler<GetCurriculumByIdQuery, CurriculumProfileDetailDto>
{
  constructor(private readonly profileRepository: ICurriculumProfileRepository) {}

  async execute(query: GetCurriculumByIdQuery): Promise<CurriculumProfileDetailDto> {
    const profile = await this.profileRepository.findById(CurriculumProfileId.from(query.id));
    if (!profile) {
      throw new CurriculumProfileNotFoundError(query.id);
    }

    return {
      id: profile.id.unpack(),
      name: profile.name,
      shortCode: profile.shortCode,
      countryCode: profile.countryCode,
      description: profile.description,
      authority: profile.authority,
      isActive: profile.isActive,
      version: profile.version,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
