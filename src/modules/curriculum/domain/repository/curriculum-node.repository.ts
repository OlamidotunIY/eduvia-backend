import { BaseRepository } from '@modules/shared';
import { CurriculumNodeId, CurriculumProfileId } from '../value-objects';
import { CurriculumNode } from '../model';

export abstract class ICurriculumNodeRepository extends BaseRepository<CurriculumNode, CurriculumNodeId> {
  public abstract findByCurriculumId(
    curriculumId: CurriculumProfileId,
    depth?: number,
  ): Promise<CurriculumNode[]>;

  public abstract findByParentId(
    parentId: CurriculumNodeId,
  ): Promise<CurriculumNode[]>;

  public abstract findSubtreeByPath(
    pathPrefix: string,
  ): Promise<CurriculumNode[]>;

  public abstract findLeafNodes(
    curriculumId: CurriculumProfileId,
  ): Promise<CurriculumNode[]>;

  public abstract search(
    query: string,
    curriculumId?: CurriculumProfileId,
  ): Promise<CurriculumNode[]>;

  public abstract findRootNodes(
    curriculumId: CurriculumProfileId,
  ): Promise<CurriculumNode[]>;
}
