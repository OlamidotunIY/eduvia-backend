import { Injectable } from '@nestjs/common';
import {
  ICurriculumQueryPort,
  SharedCurriculumNodeDto,
  SharedCurriculumProfileDto,
  SharedPlatformSubjectDto,
  SharedSubjectCurriculumMappingDto,
} from '@modules/shared';
import {
  CurriculumNodeId,
  CurriculumProfileId,
  ICurriculumNodeRepository,
  ICurriculumProfileRepository,
  IPlatformSubjectRepository,
  ISubjectCurriculumMappingRepository,
  PlatformSubjectId,
} from '../../domain';

@Injectable()
export class CurriculumQueryAdapter implements ICurriculumQueryPort {
  constructor(
    private readonly profileRepository: ICurriculumProfileRepository,
    private readonly nodeRepository: ICurriculumNodeRepository,
    private readonly subjectRepository: IPlatformSubjectRepository,
    private readonly mappingRepository: ISubjectCurriculumMappingRepository,
  ) {}

  public async getCurriculumProfileById(
    id: string,
  ): Promise<SharedCurriculumProfileDto | null> {
    const profile = await this.profileRepository.findById(CurriculumProfileId.from(id));
    if (!profile) return null;
    return {
      id: profile.id.unpack(),
      name: profile.name,
      shortCode: profile.shortCode,
      countryCode: profile.countryCode,
      description: profile.description,
      authority: profile.authority,
      isActive: profile.isActive,
      version: profile.version,
    };
  }

  public async getCurriculumNodeById(
    id: string,
  ): Promise<SharedCurriculumNodeDto | null> {
    const node = await this.nodeRepository.findById(CurriculumNodeId.from(id));
    if (!node) return null;
    return {
      id: node.id.unpack(),
      curriculumId: node.curriculumId.unpack(),
      parentNodeId: node.parentNodeId ? node.parentNodeId.unpack() : null,
      nodeType: node.nodeType,
      name: node.name,
      code: node.code,
      description: node.description,
      gradeLevel: node.gradeLevel,
      depth: node.depth,
      path: node.path.value,
      isLeaf: node.isLeaf,
      isActive: node.isActive,
    };
  }

  public async isLeafNode(id: string): Promise<boolean> {
    const node = await this.nodeRepository.findById(CurriculumNodeId.from(id));
    return node ? node.isLeaf : false;
  }

  public async getSubjectCurriculumMapping(
    platformSubjectId: string,
    curriculumId: string,
  ): Promise<SharedSubjectCurriculumMappingDto | null> {
    const mapping = await this.mappingRepository.findBySubjectAndCurriculum(
      platformSubjectId,
      curriculumId,
    );
    if (!mapping) return null;
    return {
      id: mapping.id.unpack(),
      platformSubjectId: mapping.platformSubjectId,
      curriculumId: mapping.curriculumId,
      subjectNodeId: mapping.subjectNodeId,
    };
  }

  public async resolveStudentCurriculum(
    countryCode: string,
  ): Promise<SharedCurriculumProfileDto | null> {
    const profiles = await this.profileRepository.findByCountryCode(countryCode);
    const active = profiles.find((p) => p.isActive);
    if (!active) return null;
    return {
      id: active.id.unpack(),
      name: active.name,
      shortCode: active.shortCode,
      countryCode: active.countryCode,
      description: active.description,
      authority: active.authority,
      isActive: active.isActive,
      version: active.version,
    };
  }

  public async getCurriculumNodesByPath(
    pathPrefix: string,
  ): Promise<SharedCurriculumNodeDto[]> {
    const nodes = await this.nodeRepository.findSubtreeByPath(pathPrefix);
    return nodes.map((node) => ({
      id: node.id.unpack(),
      curriculumId: node.curriculumId.unpack(),
      parentNodeId: node.parentNodeId ? node.parentNodeId.unpack() : null,
      nodeType: node.nodeType,
      name: node.name,
      code: node.code,
      description: node.description,
      gradeLevel: node.gradeLevel,
      depth: node.depth,
      path: node.path.value,
      isLeaf: node.isLeaf,
      isActive: node.isActive,
    }));
  }

  public async getLeafNodes(
    curriculumId: string,
  ): Promise<SharedCurriculumNodeDto[]> {
    const nodes = await this.nodeRepository.findLeafNodes(
      CurriculumProfileId.from(curriculumId),
    );
    return nodes.map((node) => ({
      id: node.id.unpack(),
      curriculumId: node.curriculumId.unpack(),
      parentNodeId: node.parentNodeId ? node.parentNodeId.unpack() : null,
      nodeType: node.nodeType,
      name: node.name,
      code: node.code,
      description: node.description,
      gradeLevel: node.gradeLevel,
      depth: node.depth,
      path: node.path.value,
      isLeaf: node.isLeaf,
      isActive: node.isActive,
    }));
  }

  public async getPlatformSubjectById(
    id: string,
  ): Promise<SharedPlatformSubjectDto | null> {
    const subject = await this.subjectRepository.findById(PlatformSubjectId.from(id));
    if (!subject) return null;
    return {
      id: subject.id.unpack(),
      name: subject.name,
      shortCode: subject.shortCode,
      description: subject.description,
      isActive: subject.isActive,
    };
  }
}
