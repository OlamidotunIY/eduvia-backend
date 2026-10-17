import { BaseRepository } from '@modules/shared';
import { CurriculumProfileId } from '../value-objects';
import { CurriculumProfile } from '../model';

export abstract class ICurriculumProfileRepository extends BaseRepository<CurriculumProfile, CurriculumProfileId> {
  public abstract findByShortCode(shortCode: string): Promise<CurriculumProfile | null>;
  public abstract findByCountryCode(countryCode: string): Promise<CurriculumProfile[]>;
  public abstract findActive(): Promise<CurriculumProfile[]>;
  public abstract findAll(): Promise<CurriculumProfile[]>;
}
