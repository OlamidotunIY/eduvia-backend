import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  BoardSection,
  BoardSectionId,
  SectionType,
} from '../../../domain';
import { BoardSection as PrismaBoardSection } from '@generated/prisma/client';

@Injectable()
export class BoardSectionMapper implements IMapper<BoardSection, PrismaBoardSection> {
  toDomain(record: PrismaBoardSection): BoardSection {
    return BoardSection.reconstitute({
      id: BoardSectionId.from(record.id),
      boardId: record.boardId,
      type: record.type as SectionType,
      content: record.content,
      position: record.position,
      createdBy: record.createdBy,
      isTeacherOnly: record.isTeacherOnly,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: BoardSection): Omit<PrismaBoardSection, 'id'> {
    return {
      boardId: entity.boardId,
      type: entity.type as any,
      content: entity.content,
      position: entity.position,
      createdBy: entity.createdBy,
      isTeacherOnly: entity.isTeacherOnly,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
