import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import {
  Question,
  QuestionId,
  QuestionOwnerType,
  QuestionType,
  QuestionProvenance,
  ProvenanceSource,
} from '../../../domain';
import {
  Question as PrismaQuestion,
  QuestionOption as PrismaQuestionOption,
} from '@generated/prisma/client';
import { QuestionOptionMapper } from './question-option.mapper';

@Injectable()
export class QuestionMapper implements IMapper<Question, PrismaQuestion> {
  constructor(private readonly optionMapper: QuestionOptionMapper) {}

  toDomain(
    record: PrismaQuestion & { options?: PrismaQuestionOption[] },
  ): Question {
    const provenance = QuestionProvenance.create({
      source: record.provenanceSource as ProvenanceSource,
      createdBy: record.provenanceCreatedBy,
      aiModel: record.provenanceAiModel,
      licenseRef: record.provenanceLicenseRef,
      paperRef: record.provenancePaperRef,
      approvedBy: record.provenanceApprovedBy,
      approvedAt: record.provenanceApprovedAt,
    });

    const options = record.options
      ? record.options.map((opt) => this.optionMapper.toDomain(opt))
      : [];

    const tags = Array.isArray(record.tags)
      ? (record.tags as string[])
      : [];

    return Question.reconstitute({
      id: QuestionId.from(record.id),
      ownerType: record.ownerType as QuestionOwnerType,
      ownerId: record.ownerId,
      orgId: record.orgId,
      type: record.type as QuestionType,
      stem: record.stem,
      options,
      correctOptionKey: record.correctOptionKey,
      markScheme: record.markScheme,
      maxMarks: record.maxMarks,
      difficultyLevel: record.difficultyLevel,
      subject: record.subject,
      curriculumNodeId: record.curriculumNodeId,
      examBoard: record.examBoard,
      yearGroup: record.yearGroup,
      tags,
      provenance,
      isPublished: record.isPublished,
      usageCount: record.usageCount,
      avgScore: record.avgScore,
      correctRate: record.correctRate,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: Question): Omit<PrismaQuestion, 'id'> {
    return {
      ownerType: entity.ownerType as any,
      ownerId: entity.ownerId,
      orgId: entity.orgId,
      type: entity.type as any,
      stem: entity.stem,
      correctOptionKey: entity.correctOptionKey,
      markScheme: entity.markScheme,
      maxMarks: entity.maxMarks,
      difficultyLevel: entity.difficultyLevel,
      subject: entity.subject,
      curriculumNodeId: entity.curriculumNodeId,
      examBoard: entity.examBoard,
      yearGroup: entity.yearGroup,
      tags: entity.tags as any,
      provenanceSource: entity.provenance.source as any,
      provenanceCreatedBy: entity.provenance.createdBy,
      provenanceAiModel: entity.provenance.aiModel,
      provenanceLicenseRef: entity.provenance.licenseRef,
      provenancePaperRef: entity.provenance.paperRef,
      provenanceApprovedBy: entity.provenance.approvedBy,
      provenanceApprovedAt: entity.provenance.approvedAt,
      isPublished: entity.isPublished,
      usageCount: entity.usageCount,
      avgScore: entity.avgScore,
      correctRate: entity.correctRate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
